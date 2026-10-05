'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/format'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  imageUrl: string
  stock: number
  category: { id: string; name: string; slug: string }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, loading, error, clearError } = useCart()

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 3000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handleAddToCart = async () => {
    await addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
      },
      1
    )
  }

  return (
    <div className="group rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl || '/images/product.svg'}
            alt={product.name}
            width={600}
            height={400}
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <Badge variant="secondary" className="text-xs mb-1">
            {product.category.name}
          </Badge>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-lg font-bold text-blue-600 mt-auto">
          {formatPrice(product.price)}
        </p>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{error}</p>
        )}

        {product.stock === 0 ? (
          <Badge variant="destructive" className="self-start">
            Niedostępny
          </Badge>
        ) : (
          <Button
            size="sm"
            className="w-full"
            disabled={loading}
            onClick={handleAddToCart}
          >
            {loading ? 'Dodawanie…' : 'Dodaj do koszyka'}
          </Button>
        )}
      </div>
    </div>
  )
}
