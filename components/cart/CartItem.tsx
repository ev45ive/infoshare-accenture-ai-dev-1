'use client'
import Image from 'next/image'

interface CartItemProps {
  item: {
    productId: string
    name: string
    price: number
    quantity: number
    imageUrl: string
  }
  onRemove: (productId: string) => void
  onUpdateQty: (productId: string, qty: number) => void
  formatPrice: (cents: number) => string
}

export function CartItem({ item, onRemove, onUpdateQty, formatPrice }: CartItemProps) {
  const subtotal = item.price * item.quantity

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-b-0">
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={64}
          height={64}
          unoptimized
          className="w-16 h-16 object-cover rounded flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{item.name}</p>
        <p className="text-sm text-gray-500">{formatPrice(item.price)} / szt.</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
          aria-label="Zmniejsz ilość"
        >
          −
        </button>
        <span className="w-6 text-center tabular-nums">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          disabled={item.quantity >= 10}
          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
          aria-label="Zwiększ ilość"
        >
          +
        </button>
      </div>

      <p className="font-bold w-20 text-right flex-shrink-0">{formatPrice(subtotal)}</p>

      <button
        onClick={() => onRemove(item.productId)}
        className="ml-2 text-red-500 hover:text-red-700 text-sm flex-shrink-0"
        aria-label="Usuń produkt"
      >
        Usuń
      </button>
    </div>
  )
}
