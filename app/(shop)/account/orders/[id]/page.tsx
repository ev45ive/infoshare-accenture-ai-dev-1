import { notFound } from 'next/navigation'
import { getOrderDetail } from '@/lib/actions/checkout'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  ACCEPTED: 'Przyjęte',
  PROCESSING: 'W realizacji',
  SHIPPED: 'Wysłane',
  DELIVERED: 'Dostarczone',
  CANCELLED: 'Anulowane',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderDetail(id)
  if (!order) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account/orders" className="text-gray-400 hover:text-gray-600">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Zamówienie #{order.orderNumber}</h1>
      </div>

      <div className="space-y-6">
        {/* Status */}
        <div className="bg-white border rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
            <p className="font-medium">{STATUS_LABELS[order.status] ?? order.status}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Data złożenia</p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-4">Pozycje zamówienia</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName}{' '}
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Dostawa</span>
              <span>{formatPrice(order.deliveryCost)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Razem</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <div className="bg-white border rounded-xl p-4">
            <h2 className="font-semibold mb-3">Adres dostawy</h2>
            <p className="text-sm">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p className="text-sm text-gray-600">{order.address.street}</p>
            <p className="text-sm text-gray-600">
              {order.address.postalCode} {order.address.city}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
