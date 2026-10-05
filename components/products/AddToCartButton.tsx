'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  imageUrl: string
  stock: number
  category: { id: string; name: string; slug: string }
}

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1)
  const { addItem, loading, error, clearError } = useCart()

  if (product.stock === 0) {
    return (
      <p className="text-gray-500 font-medium">Niedostępny w magazynie</p>
    )
  }

  const handleAdd = async () => {
    clearError()
    await addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
      },
      qty
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium text-gray-700">
          Ilość:
        </label>
        <select
          id="qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={handleAdd}
      >
        {loading ? 'Dodawanie…' : 'Dodaj do koszyka'}
      </Button>
    </div>
  )
}
