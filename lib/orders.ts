import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { processPayment } from '@/lib/payment'
import { AddressSchema } from '@/lib/validations/checkout'
import { formatPrice, formatDeliveryCost } from '@/lib/format'
import type { PaymentMethod } from '@prisma/client'
import type { SessionUser } from '@/types'
import { DELIVERY_OPTIONS, calculateOrderTotals, type DeliveryMethod } from '@/lib/constants/checkout'

// Bez 'use server': eksport tutaj nie może stać się publiczną akcją przyjmującą dowolnego użytkownika.

export type CreateOrderParams = {
  address: {
    firstName: string
    lastName: string
    street: string
    city: string
    postalCode: string
    country?: string
    phone: string
  }
  paymentMethod: 'CARD' | 'BLIK'
  deliveryMethod: DeliveryMethod
}

export async function placeOrder(user: SessionUser, params: CreateOrderParams) {
  // Waliduj adres
  const addrParsed = AddressSchema.safeParse(params.address)
  if (!addrParsed.success) {
    return { error: 'Nieprawidłowe dane adresu.', fieldErrors: addrParsed.error.flatten().fieldErrors }
  }

  // Pobierz koszyk
  const cartItems = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  })

  if (cartItems.length === 0) return { error: 'Koszyk jest pusty.' }

  // KOS-08: sprawdź dostępność produktów
  const unavailable = cartItems.filter((i) => i.product.stock === 0)
  if (unavailable.length > 0) {
    return {
      error: 'Niektóre produkty w koszyku stały się niedostępne.',
      unavailableProducts: unavailable.map((i) => i.product.name),
    }
  }

  const deliveryOption = DELIVERY_OPTIONS.find((o) => o.id === params.deliveryMethod)
  if (!deliveryOption) return { error: 'Nieprawidłowa metoda dostawy.' }

  const { subtotal, deliveryCost, total } = calculateOrderTotals(
    cartItems.map((i) => ({ price: i.product.price, quantity: i.quantity })),
    params.deliveryMethod,
  )

  // Przetwórz płatność (mock)
  const paymentResult = await processPayment(total)
  if (!paymentResult.success) {
    return { error: paymentResult.message, code: paymentResult.code }
  }

  // Zapisz adres
  const address = await db.address.create({
    data: { userId: user.id, ...addrParsed.data },
  })

  // Utwórz zamówienie ze snapshotem produktów (CHK-10)
  const order = await db.order.create({
    data: {
      userId: user.id,
      addressId: address.id,
      paymentMethod: params.paymentMethod as PaymentMethod,
      paymentStatus: 'PAID',
      transactionId: paymentResult.transactionId,
      deliveryMethod: params.deliveryMethod,
      deliveryCost,
      subtotal,
      total,
      items: {
        create: cartItems.map((i) => ({
          productId: i.productId,
          productName: i.product.name, // snapshot
          price: i.product.price,       // snapshot
          quantity: i.quantity,
        })),
      },
      statusHistory: {
        create: { status: 'ACCEPTED', note: 'Zamówienie przyjęte do realizacji' },
      },
    },
  })

  // Wyczyść koszyk
  await db.cartItem.deleteMany({ where: { userId: user.id } })

  // Email potwierdzający (CHK-10)
  sendEmail({
    to: user.email,
    subject: `✅ Potwierdzenie zamówienia #${order.orderNumber}`,
    html: `
      <h2>Zamówienie przyjęte!</h2>
      <p>Numer zamówienia: <strong>${order.orderNumber}</strong></p>
      <table>
        ${cartItems.map((i) => `<tr><td>${i.product.name} ×${i.quantity}</td><td>${formatPrice(i.product.price * i.quantity)}</td></tr>`).join('')}
        <tr><td><em>Dostawa (${deliveryOption.label})</em></td><td>${formatDeliveryCost(deliveryCost)}</td></tr>
        <tr><td><strong>Razem</strong></td><td><strong>${formatPrice(total)}</strong></td></tr>
      </table>
      <p>Szacowany czas dostawy: ${params.deliveryMethod === 'COURIER' ? '1–2 dni robocze' : '2–3 dni robocze'}.</p>
    `,
  })

  return { success: true as const, orderId: order.id, orderNumber: order.orderNumber }
}
