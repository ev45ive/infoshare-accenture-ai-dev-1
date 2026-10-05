'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

export default function ResetPage() {
  const [status, setStatus] = useState('')
  async function reset() {
    const response = await fetch('/api/workshop/browser-reset', { method: 'POST' })
    if (!response.ok) { setStatus('Reset niedostępny. Sprawdź lokalne środowisko warsztatu.'); return }
    useCartStore.getState().clearCart()
    localStorage.removeItem('shopeasy-guest-cart')
    sessionStorage.removeItem('checkout_delivery')
    setStatus('Przeglądarka i wiadomości zresetowane. Możesz wrócić do katalogu.')
  }
  return <main className="max-w-xl mx-auto p-8 space-y-4">
    <h1 className="text-2xl font-bold">Reset przeglądarki ShopEasy</h1>
    <p>Najpierw zatrzymaj serwer, wykonaj reset bazy i ponownie uruchom aplikację. Ten krok usuwa sesję, koszyk gościa, formularz dostawy i lokalne wiadomości.</p>
    <button className="rounded bg-blue-600 text-white px-4 py-2" onClick={reset}>Wyczyść stan przeglądarki</button>
    <p role="status">{status}</p>
    <Link href="/products" className="text-blue-600 underline">Katalog produktów</Link>
  </main>
}
