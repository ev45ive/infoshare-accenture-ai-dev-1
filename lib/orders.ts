import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { processPayment } from '@/lib/payment'
import { AddressSchema } from '@/lib/validations/checkout'
import { formatPrice, formatDeliveryCost } from '@/lib/format'
import type { PaymentMethod } from '@prisma/client'
import type { SessionUser } from '@/types'
import { DELIVERY_OPTIONS, calculateOrderTotals, type DeliveryMethod } from '@/lib/constants/checkout'
import { CHECKOUT_LIMIT_MESSAGE, classifyCheckoutItems } from '@/lib/constants/cart'

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

export type PlaceOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | {
      success: false
      error: string
      code?: string
      fieldErrors?: Record<string, string[] | undefined>
      unavailableProducts?: string[]
    }

export async function placeOrder(user: SessionUser, params: CreateOrderParams): Promise<PlaceOrderResult> {
  // Waliduj adres
  const addrParsed = AddressSchema.safeParse(params.address)
  if (!addrParsed.success) {
    return { success: false, error: 'Nieprawidłowe dane adresu.', fieldErrors: addrParsed.error.flatten().fieldErrors }
  }

  // Pobierz koszyk
  let cartItems = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  })

  // Pozycje ze stanem 0 są usuwane po cichu, zamówienie idzie z pozostałych.
  const issues = classifyCheckoutItems(
    cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity, stock: i.product.stock })),
  )
  if (issues.remove.length > 0) {
    await db.cartItem.deleteMany({ where: { userId: user.id, productId: { in: issues.remove } } })
    cartItems = cartItems.filter((i) => !issues.remove.includes(i.productId))
  }

  if (cartItems.length === 0) return { success: false, error: 'Koszyk jest pusty.' }

  // Ilość ponad min(10, stan): przytnij w koszyku i nie twórz zamówienia.
  if (issues.clamp.length > 0) {
    await db.$transaction(
      issues.clamp.map((c) =>
        db.cartItem.update({
          where: { userId_productId: { userId: user.id, productId: c.productId } },
          data: { quantity: c.quantity },
        }),
      ),
    )
    return { success: false, error: CHECKOUT_LIMIT_MESSAGE }
  }

  const deliveryOption = DELIVERY_OPTIONS.find((o) => o.id === params.deliveryMethod)
  if (!deliveryOption) return { success: false, error: 'Nieprawidłowa metoda dostawy.' }

  const { subtotal, deliveryCost, total } = calculateOrderTotals(
    cartItems.map((i) => ({ price: i.product.price, quantity: i.quantity })),
    params.deliveryMethod,
  )

  // Przetwórz płatność (mock)
  const paymentResult = await processPayment(total)
  if (!paymentResult.success) {
    return { success: false, error: paymentResult.message, code: paymentResult.code }
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

  return { success: true, orderId: order.id, orderNumber: order.orderNumber }
}
