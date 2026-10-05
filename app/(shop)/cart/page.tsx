'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cart'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { buttonVariants } from '@/components/ui/button'

export default function CartPage() {
  const { items, total, count, loading, error, removeItem, updateQty, formatPrice } = useCart()

  // Rehydrate Zustand persist store on client mount
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Ładowanie koszyka...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Twój koszyk jest pusty</h1>
        <p className="text-gray-500 mb-8">Dodaj produkty do koszyka, aby kontynuować zakupy.</p>
        <Link href="/products" className={buttonVariants()}>
          Przeglądaj produkty
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Koszyk ({count} szt.)</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onRemove={removeItem}
              onUpdateQty={updateQty}
              formatPrice={formatPrice}
            />
          ))}
        </div>
        {/* Summary */}
        <div>
          <CartSummary total={total} count={count} formatPrice={formatPrice} />
        </div>
      </div>
    </div>
  )
}
