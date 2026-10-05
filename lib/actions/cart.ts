'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import type { CartCookieItem } from '@/types'

const CART_LIMIT = 5 // BR-01: max 5 różnych produktów

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

  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) return { error: 'Produkt nie istnieje.' }

  // KAT-05: produkt niedostępny
  if (product.stock === 0) {
    return { error: 'Produkt jest chwilowo niedostępny.' }
  }

  // Jeśli już w koszyku — zwiększ ilość
  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  })

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    })
    revalidatePath('/cart')
    return { success: true }
  }

  // BR-01: limit 5 różnych produktów
  const count = await db.cartItem.count({ where: { userId: user.id } })
  if (count >= CART_LIMIT) {
    return {
      error: `Osiągnięto limit pozycji dla konta standardowego (${CART_LIMIT}). Usuń produkt lub przejdź na konto Premium.`,
    }
  }

  await db.cartItem.create({ data: { userId: user.id, productId, quantity } })
  revalidatePath('/cart')
  return { success: true }
}

export async function removeFromDbCart(productId: string) {
  const user = await getSessionUser()
  if (!user) return { error: 'Niezalogowany.' }

  await db.cartItem.deleteMany({ where: { userId: user.id, productId } })
  revalidatePath('/cart')
  return { success: true }
}

export async function updateDbCartQuantity(productId: string, quantity: number) {
  const user = await getSessionUser()
  if (!user) return { error: 'Niezalogowany.' }

  if (quantity <= 0) return removeFromDbCart(productId)

  await db.cartItem.updateMany({
    where: { userId: user.id, productId },
    data: { quantity },
  })
  revalidatePath('/cart')
  return { success: true }
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

  for (const item of items) {
    const existing = await db.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId: item.productId } },
    })

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.max(existing.quantity, item.quantity) },
      })
    } else {
      const count = await db.cartItem.count({ where: { userId: user.id } })
      if (count >= CART_LIMIT) break // BR-01: cicha blokada

      await db.cartItem.create({
        data: { userId: user.id, productId: item.productId, quantity: item.quantity },
      }).catch(() => null) // ignoruj nieistniejące produkty
    }
  }

  revalidatePath('/cart')
  return { success: true }
}
