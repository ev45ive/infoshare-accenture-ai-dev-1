'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddressSchema, type AddressInput } from '@/lib/validations/checkout'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DELIVERY_OPTIONS, calculateDeliveryCost, calculateOrderTotals, type DeliveryMethod } from '@/lib/constants/checkout'
import { formatDeliveryCost, formatPrice } from '@/lib/format'
import type { z } from 'zod'

const DELIVERY_TEXT: Record<DeliveryMethod, { label: string; sublabel: string }> = {
  COURIER: { label: 'Kurier DHL', sublabel: '1–2 dni robocze' },
  PARCEL_LOCKER: { label: 'Paczkomat InPost', sublabel: '2–3 dni robocze' },
}

export default function DeliveryPage() {
  const router = useRouter()
  const { items, count, formatPrice: cartFormatPrice } = useCart()
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMethod>('COURIER')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof AddressSchema>, unknown, AddressInput>({
    resolver: zodResolver(AddressSchema),
    defaultValues: { country: 'PL' },
  })

  function onSubmit(data: AddressInput) {
    sessionStorage.setItem(
      'checkout_delivery',
      JSON.stringify({
        address: data,
        deliveryMethod: selectedDelivery,
      })
    )
    router.push('/checkout/payment')
  }

  const { subtotal, deliveryCost, total: orderTotal } = calculateOrderTotals(items, selectedDelivery)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Dostawa i adres</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Address section */}
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-lg">Adres dostawy</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">Imię</Label>
                  <Input id="firstName" {...register('firstName')} placeholder="Jan" />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Nazwisko</Label>
                  <Input id="lastName" {...register('lastName')} placeholder="Kowalski" />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="street">Ulica i numer</Label>
                <Input id="street" {...register('street')} placeholder="ul. Kwiatowa 12/5" />
                {errors.street && (
                  <p className="text-red-500 text-sm">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="postalCode">Kod pocztowy</Label>
                  <Input id="postalCode" {...register('postalCode')} placeholder="00-001" />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm">{errors.postalCode.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">Miasto</Label>
                  <Input id="city" {...register('city')} placeholder="Warszawa" />
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" {...register('phone')} placeholder="+48 600 000 000" />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>

              <input type="hidden" {...register('country')} />
            </div>

            {/* Delivery method section */}
            <div className="bg-white border rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-lg">Metoda dostawy</h2>
              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const optionCost = calculateDeliveryCost(subtotal, option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedDelivery(option.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedDelivery === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedDelivery === option.id ? 'border-blue-600' : 'border-gray-400'
                          }`}
                        >
                          {selectedDelivery === option.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{DELIVERY_TEXT[option.id].label}</p>
                          <p className="text-sm text-gray-500">{DELIVERY_TEXT[option.id].sublabel}</p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {optionCost < option.cost && (
                          <s className="mr-2 font-normal text-gray-500">{formatPrice(option.cost)}</s>
                        )}
                        {formatDeliveryCost(optionCost)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Przejdź do płatności
            </Button>
          </form>
        </div>

        {/* Cart summary column */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-6 sticky top-4">
            <h2 className="font-semibold text-lg mb-4">
              Podsumowanie koszyka ({count} {count === 1 ? 'produkt' : 'produkty'})
            </h2>

            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">Koszyk jest pusty</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">{cartFormatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Produkty</span>
                <span>{cartFormatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Dostawa</span>
                <span>{formatDeliveryCost(deliveryCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Razem</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
