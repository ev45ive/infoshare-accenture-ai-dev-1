'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { addToCart, removeFromCart, updateCartQuantity, mergeCart } from '@/lib/cart'
import type { CartCookieItem } from '@/types'

// ─── Odczyt ──────────────────────────────────────────────

export async function getDbCart() {
  const user = await getSessionUser()
  if (!user) return []

  return db.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

// ─── Mutacje ─────────────────────────────────────────────

export async function addToDbCart(productId: string, quantity = 1) {
  const user = await getSessionUser()
  if (!user) return { error: 'Zaloguj się, aby dodać do koszyka.' }

  const result = await addToCart(user.id, productId, quantity)
  if (result.success) revalidatePath('/cart')
  return result
}

export async function removeFromDbCart(productId: string) {
  const user = await getSessionUser()
  if (!user) return { error: 'Niezalogowany.' }

  const result = await removeFromCart(user.id, productId)
  revalidatePath('/cart')
  return result
}

export async function updateDbCartQuantity(productId: string, quantity: number) {
  const user = await getSessionUser()
  if (!user) return { error: 'Niezalogowany.' }

  const result = await updateCartQuantity(user.id, productId, quantity)
  revalidatePath('/cart')
  return result
}

export async function clearDbCart() {
  const user = await getSessionUser()
  if (!user) return { error: 'Niezalogowany.' }

  await db.cartItem.deleteMany({ where: { userId: user.id } })
  revalidatePath('/cart')
  return { success: true }
}

// KOS-02: merge koszyka gościa po zalogowaniu
export async function mergeGuestCart(items: CartCookieItem[]) {
  const user = await getSessionUser()
  if (!user || items.length === 0) return { success: true }

  const result = await mergeCart(user.id, items)
  revalidatePath('/cart')
  return result
}
