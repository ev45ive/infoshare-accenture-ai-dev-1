import { getOrderDetail } from '@/lib/actions/checkout'
import { formatPrice } from '@/lib/products'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams
  if (!orderId) notFound()

  const order = await getOrderDetail(orderId)
  if (!order) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-2">Zamówienie złożone!</h1>
      <p className="text-gray-600 mb-8">
        Dziękujemy za zakup. Potwierdzenie wysłano na Twój adres e-mail.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
        <h2 className="font-semibold mb-4">
          Szczegóły zamówienia #{order.id.slice(-8).toUpperCase()}
        </h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Dostawa</span>
            <span>{formatPrice(order.deliveryCost)}</span>
          </div>
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between font-bold">
          <span>Razem</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/products"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Wróć do sklepu
        </Link>
        <Link
          href="/account/orders"
          className="px-6 py-3 border rounded-lg hover:bg-gray-100"
        >
          Moje zamówienia
        </Link>
      </div>
    </div>
  )
}
