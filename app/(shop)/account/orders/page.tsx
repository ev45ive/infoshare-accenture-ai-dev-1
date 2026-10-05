import Link from 'next/link'
import { getOrderHistory } from '@/lib/actions/checkout'
import { formatPrice } from '@/lib/format'

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: 'Przyjęte',
  PROCESSING: 'W realizacji',
  SHIPPED: 'Wysłane',
  DELIVERED: 'Dostarczone',
  CANCELLED: 'Anulowane',
}

export default async function OrdersPage() {
  const orders = await getOrderHistory()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Historia zamówień</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">Nie masz jeszcze żadnych zamówień.</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Przejdź do sklepu →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block border rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm font-medium">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(order.total)}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
