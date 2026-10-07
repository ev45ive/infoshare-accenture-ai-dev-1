import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { DELIVERY_OPTIONS, FREE_DELIVERY_THRESHOLD } from '@/lib/constants/checkout'

const LOWEST_DELIVERY_COST = Math.min(...DELIVERY_OPTIONS.map((option) => option.cost))

interface CartSummaryProps {
  total: number
  count: number
  formatPrice: (cents: number) => string
}

export function CartSummary({ total, count, formatPrice }: CartSummaryProps) {
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - total)

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold">Podsumowanie</h2>

      <div className="flex justify-between text-sm">
        <span>Produkty ({count} szt.)</span>
        <span>{formatPrice(total)}</span>
      </div>

      <div className="flex justify-between gap-4 text-sm text-gray-500">
        <span>Dostawa</span>
        <span className="text-right">
          Od {formatPrice(LOWEST_DELIVERY_COST)}; gratis kurierem od {FREE_DELIVERY_THRESHOLD / 100} zł
        </span>
      </div>

      <div className="space-y-1">
        <progress
          aria-label="Postęp do darmowej dostawy"
          value={Math.min(total, FREE_DELIVERY_THRESHOLD)}
          max={FREE_DELIVERY_THRESHOLD}
          className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
        />
        <p className="text-sm">
          {remaining > 0
            ? `Brakuje ${formatPrice(remaining)} do darmowej dostawy`
            : 'Masz darmową dostawę kurierem DHL'}
        </p>
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
