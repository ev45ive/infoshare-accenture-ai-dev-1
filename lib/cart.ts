import { db } from '@/lib/db'
import type { CartCookieItem } from '@/types'

// Bez 'use server': funkcje przyjmują userId, więc nie mogą być publicznymi akcjami.

export const CART_LIMIT = 5 // BR-01: max 5 różnych produktów

export type CartResult =
  | { success: true; error?: undefined }
  | { success?: undefined; error: string }

export async function addToCart(userId: string, productId: string, quantity = 1): Promise<CartResult> {
  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) return { error: 'Produkt nie istnieje.' }

  // KAT-05: produkt niedostępny
  if (product.stock === 0) {
    return { error: 'Produkt jest chwilowo niedostępny.' }
  }

  // Jeśli już w koszyku — zwiększ ilość
  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  })

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    })
    return { success: true }
  }

  // BR-01: limit 5 różnych produktów
  const count = await db.cartItem.count({ where: { userId } })
  if (count >= CART_LIMIT) {
    return {
      error: `Osiągnięto limit pozycji dla konta standardowego (${CART_LIMIT}). Usuń produkt lub przejdź na konto Premium.`,
    }
  }

  await db.cartItem.create({ data: { userId, productId, quantity } })
  return { success: true }
}

export async function removeFromCart(userId: string, productId: string): Promise<CartResult> {
  await db.cartItem.deleteMany({ where: { userId, productId } })
  return { success: true }
}

export async function updateCartQuantity(userId: string, productId: string, quantity: number): Promise<CartResult> {
  if (quantity <= 0) return removeFromCart(userId, productId)

  await db.cartItem.updateMany({
    where: { userId, productId },
    data: { quantity },
  })
  return { success: true }
}

// KOS-02: merge koszyka gościa po zalogowaniu
export async function mergeCart(userId: string, items: CartCookieItem[]): Promise<CartResult> {
  for (const item of items) {
    const existing = await db.cartItem.findUnique({
      where: { userId_productId: { userId, productId: item.productId } },
    })

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.max(existing.quantity, item.quantity) },
      })
    } else {
      const count = await db.cartItem.count({ where: { userId } })
      if (count >= CART_LIMIT) break // BR-01: cicha blokada

      await db.cartItem.create({
        data: { userId, productId: item.productId, quantity: item.quantity },
      }).catch(() => null) // ignoruj nieistniejące produkty
    }
  }

  return { success: true }
}
