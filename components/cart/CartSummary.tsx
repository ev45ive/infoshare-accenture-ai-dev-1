import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

interface CartSummaryProps {
  total: number
  count: number
  formatPrice: (cents: number) => string
}

export function CartSummary({ total, count, formatPrice }: CartSummaryProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold">Podsumowanie</h2>

      <div className="flex justify-between text-sm">
        <span>Produkty ({count} szt.)</span>
        <span>{formatPrice(total)}</span>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>Dostawa</span>
        <span>obliczana przy kasie</span>
      </div>

      <hr className="border-border" />

      <div className="flex justify-between font-bold text-lg">
        <span>Łącznie</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Link href="/checkout/delivery" className={buttonVariants({ className: 'w-full justify-center' })}>
        Przejdź do kasy
      </Link>
    </div>
  )
}
