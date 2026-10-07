'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { placeOrder, type CreateOrderParams, type PlaceOrderResult } from '@/lib/orders'

export async function createOrder(params: CreateOrderParams): Promise<PlaceOrderResult> {
  const user = await getSessionUser()
  if (!user) return { success: false, error: 'Zaloguj się, aby złożyć zamówienie.' }

  const result = await placeOrder(user, params)
  if (result.success) revalidatePath('/account/orders')
  return result
}

// ─── Historia zamówień ─────────────────────────────────────

export async function getOrderHistory() {
  const user = await getSessionUser()
  if (!user) return []

  return db.order.findMany({
    where: { userId: user.id },
    include: { items: true, address: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrderDetail(orderId: string) {
  const user = await getSessionUser()
  if (!user) return null

  return db.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: { include: { product: true } },
      address: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })
}
