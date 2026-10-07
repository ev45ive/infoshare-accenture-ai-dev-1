'use client'
import { useState, useEffect, useCallback } from 'react'
import { useCartStore } from '@/store/cart'
import {
  addToDbCart,
  removeFromDbCart,
  updateDbCartQuantity,
  clearDbCart,
  mergeGuestCart,
} from '@/lib/actions/cart'
import { formatPrice } from '@/lib/format'
import { CART_MESSAGES } from './cart-messages'
import { checkGuestAdd, checkGuestUpdate, mapCartRow, type CartRow } from './cart-limit'

// Kształt pozycji koszyka — wspólny dla gościa i zalogowanego
export type CartLineItem = {
  productId: string
  name: string
  price: number       // grosze
  quantity: number
  imageUrl: string
  stock?: number      // brak dla gościa (stan nieznany)
}

export function useCart() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [dbItems, setDbItems] = useState<CartLineItem[]>([])
  const [loadingDb, setLoadingDb] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Zustand (gość)
  const guestItems = useCartStore((s) => s.items)
  const guestAdd = useCartStore((s) => s.addItem)
  const guestRemove = useCartStore((s) => s.removeItem)
  const guestUpdate = useCartStore((s) => s.updateQuantity)
  const guestClear = useCartStore((s) => s.clearCart)

  // Hydrate guest cart po mount (skipHydration: true w store)
  useEffect(() => {
    useCartStore.persist.rehydrate()
    let active = true
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then((session) => { if (active) setIsLoggedIn(!!session.user) })
      .catch(() => { if (active) setError('Nie udało się sprawdzić sesji. Odśwież stronę.') })
    return () => { active = false }
  }, [])

  // Pobierz DB koszyk dla zalogowanego
  const fetchDbCart = useCallback(async () => {
    setLoadingDb(true)
    try {
      const res = await fetch('/api/cart')
      if (!res.ok) throw new Error('Nie udało się pobrać koszyka.')
      const rows = await res.json()
      setDbItems((rows as CartRow[]).map(mapCartRow))
    } catch {
      setError('Nie udało się pobrać koszyka. Odśwież stronę.')
    } finally {
      setLoadingDb(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    let active = true
    async function load() {
      const guest = useCartStore.getState().items
      if (guest.length) {
        const result = await mergeGuestCart(guest.map(({ productId, quantity }) => ({ productId, quantity })))
        if (result.success) useCartStore.getState().clearCart()
      }
      if (active) await fetchDbCart()
    }
    load().catch(() => { if (active) setError('Nie udało się połączyć koszyka. Odśwież stronę.') })
    return () => { active = false }
  }, [isLoggedIn, fetchDbCart])

  // Unifikacja — zwróć właściwe items w zależności od stanu logowania
  const items: CartLineItem[] = isLoggedIn ? dbItems : guestItems

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  // ─── Akcje ────────────────────────────────────────────

  async function addItem(
    product: { id: string; name: string; price: number; stock: number; imageUrl: string },
    quantity = 1
  ): Promise<{ success?: boolean; error?: string }> {
    setError(null)

    if (isLoggedIn) {
      const result = await addToDbCart(product.id, quantity)
      if (result?.success) await fetchDbCart()
      if (result?.error) setError(result.error)
      return result
    }

    // Guest — limitacja BR-01 po stronie klienta
    const currentDistinct = new Set(guestItems.map((i) => i.productId))
    if (!currentDistinct.has(product.id) && currentDistinct.size >= 5) {
      const msg = CART_MESSAGES.itemsLimitPremium
      setError(msg)
      return { error: msg }
    }

    const limitCheck = checkGuestAdd(guestItems, product.id, quantity)
    if (!limitCheck.ok) {
      setError(limitCheck.error)
      return { error: limitCheck.error }
    }

    guestAdd({ productId: product.id, name: product.name, price: product.price, quantity, imageUrl: product.imageUrl })
    return { success: true }
  }

  async function removeItem(productId: string) {
    if (isLoggedIn) {
      await removeFromDbCart(productId)
      await fetchDbCart()
    } else {
      guestRemove(productId)
    }
  }

  async function updateQty(productId: string, quantity: number) {
    if (quantity <= 0) return removeItem(productId)
    setError(null)
    if (isLoggedIn) {
      const result = await updateDbCartQuantity(productId, quantity)
      if (result?.error) setError(result.error)
      await fetchDbCart()
    } else {
      const current = guestItems.find((i) => i.productId === productId)?.quantity ?? 0
      const limitCheck = checkGuestUpdate(current, quantity)
      if (!limitCheck.ok) {
        setError(limitCheck.error)
        return
      }
      guestUpdate(productId, quantity)
    }
  }

  async function clear() {
    if (isLoggedIn) {
      await clearDbCart()
      setDbItems([])
    } else {
      guestClear()
    }
  }

  return {
    items,
    total,
    count,
    loading: loadingDb,
    error,
    clearError: () => setError(null),
    isLoggedIn,
    addItem,
    removeItem,
    updateQty,
    clear,
    refresh: fetchDbCart,
    // helpers
    formatPrice,
  }
}
