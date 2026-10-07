'use client'

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardPaymentSchema, BlikSchema, type CardPaymentInput, type BlikInput } from '@/lib/validations/checkout'
import { createOrder } from '@/lib/actions/checkout'
import { useCart } from '@/hooks/useCart'
import { getOrderErrorTitle } from '@/hooks/order-error'
import { CART_MESSAGES } from '@/hooks/cart-messages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DELIVERY_OPTIONS, calculateOrderTotals, type DeliveryMethod } from '@/lib/constants/checkout'

type PaymentTab = 'CARD' | 'BLIK'

function subscribeDelivery(listener: () => void) {
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}
function getDeliverySnapshot() { return sessionStorage.getItem('checkout_delivery') }
function getServerDeliverySnapshot(): undefined { return undefined }

export default function PaymentPage() {
  const router = useRouter()
  const { items, total, formatPrice, refresh } = useCart()

  const [selectedTab, setSelectedTab] = useState<PaymentTab>('CARD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentErrorTitle, setPaymentErrorTitle] = useState<string>(CART_MESSAGES.paymentErrorTitle)
  const deliveryRaw = useSyncExternalStore(subscribeDelivery, getDeliverySnapshot, getServerDeliverySnapshot)
  const deliveryMethod = useMemo<DeliveryMethod | null>(() => {
    if (!deliveryRaw) return null
    try {
      const stored = JSON.parse(deliveryRaw)
      return DELIVERY_OPTIONS.some((option) => option.id === stored.deliveryMethod) ? stored.deliveryMethod : null
    } catch { return null }
  }, [deliveryRaw])
  const orderTotal = deliveryMethod ? calculateOrderTotals(items, deliveryMethod).total : total

  // CHK-07: 15-minute countdown timer
  const [timeLeft, setTimeLeft] = useState(15 * 60)

  useEffect(() => {
    if (deliveryRaw === undefined) return
    if (!deliveryMethod) {
      sessionStorage.removeItem('checkout_delivery')
      router.replace('/checkout/delivery')
    }
  }, [deliveryRaw, deliveryMethod, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/cart?timeout=1')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')
  const isUrgent = timeLeft < 2 * 60

  // Card form
  const {
    register: registerCard,
    handleSubmit: handleSubmitCard,
    formState: { errors: cardErrors },
  } = useForm<CardPaymentInput>({ resolver: zodResolver(CardPaymentSchema) })

  // BLIK form
  const {
    register: registerBlik,
    handleSubmit: handleSubmitBlik,
    formState: { errors: blikErrors },
  } = useForm<BlikInput>({ resolver: zodResolver(BlikSchema) })

  async function submitPayment() {
    const deliveryRaw = sessionStorage.getItem('checkout_delivery')
    if (!deliveryRaw) {
      router.replace('/checkout/delivery')
      return
    }
    const delivery = JSON.parse(deliveryRaw)

    setIsSubmitting(true)
    setPaymentError(null)

    try {
      const result = await createOrder({
        address: delivery.address,
        deliveryMethod: delivery.deliveryMethod,
        paymentMethod: selectedTab,
      })

      if (result.success) {
        sessionStorage.removeItem('checkout_delivery')
        router.push(`/checkout/success?orderId=${result.orderId}`)
      } else {
        setPaymentErrorTitle(getOrderErrorTitle(result))
        setPaymentError(result.error || 'Błąd płatności')
        await refresh()
      }
    } catch {
      setPaymentErrorTitle(CART_MESSAGES.paymentErrorTitle)
      setPaymentError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Countdown timer */}
      <div
        className={`flex items-center gap-2 mb-6 px-4 py-3 rounded-lg font-semibold text-lg ${
          isUrgent ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        <span>⏱</span>
        <span>
          Czas na płatność:{' '}
          <span className="font-mono text-xl">
            {minutes}:{seconds}
          </span>
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-8">Płatność</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab switcher */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Metoda płatności</h2>

            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setSelectedTab('CARD')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  selectedTab === 'CARD'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Karta płatnicza
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('BLIK')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  selectedTab === 'BLIK'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                BLIK
              </button>
            </div>

            {/* CARD form */}
            {selectedTab === 'CARD' && (
              <form
                id="card-form"
                onSubmit={handleSubmitCard(submitPayment)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="cardName">Imię i nazwisko na karcie</Label>
                  <Input
                    id="cardName"
                    {...registerCard('name')}
                    placeholder="Jan Kowalski"
                    autoComplete="cc-name"
                  />
                  {cardErrors.name && (
                    <p className="text-red-500 text-sm">{cardErrors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cardNumber">Numer karty</Label>
                  <Input
                    id="cardNumber"
                    {...registerCard('cardNumber')}
                    placeholder="1234567890123456"
                    autoComplete="cc-number"
                    maxLength={16}
                  />
                  {cardErrors.cardNumber && (
                    <p className="text-red-500 text-sm">{cardErrors.cardNumber.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="cardExpiry">Data ważności</Label>
                    <Input
                      id="cardExpiry"
                      {...registerCard('expiry')}
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                      maxLength={5}
                    />
                    {cardErrors.expiry && (
                      <p className="text-red-500 text-sm">{cardErrors.expiry.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      {...registerCard('cvv')}
                      placeholder="123"
                      autoComplete="cc-csc"
                      maxLength={4}
                      type="password"
                    />
                    {cardErrors.cvv && (
                      <p className="text-red-500 text-sm">{cardErrors.cvv.message}</p>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* BLIK form */}
            {selectedTab === 'BLIK' && (
              <form
                id="blik-form"
                onSubmit={handleSubmitBlik(submitPayment)}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="blikCode">Kod BLIK</Label>
                  <Input
                    id="blikCode"
                    {...registerBlik('code')}
                    placeholder="123456"
                    maxLength={6}
                    inputMode="numeric"
                    className="text-2xl tracking-widest text-center font-mono"
                  />
                  {blikErrors.code && (
                    <p className="text-red-500 text-sm">{blikErrors.code.message}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    Wygeneruj kod w aplikacji mobilnej swojego banku.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Error message */}
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">{paymentErrorTitle}</p>
              <p className="text-sm">{paymentError}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            form={selectedTab === 'CARD' ? 'card-form' : 'blik-form'}
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Przetwarzanie...' : 'Zapłać'}
          </Button>
        </div>

        {/* Cart summary column */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl p-6 sticky top-4">
            <h2 className="font-semibold text-lg mb-4">Twoje zamówienie</h2>

            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">Koszyk jest pusty</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t mt-4 pt-4 flex justify-between font-bold">
              <span>Razem</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              * Cena zawiera dostawę.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
