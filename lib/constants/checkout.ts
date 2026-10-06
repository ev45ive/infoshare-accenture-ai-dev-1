export const DELIVERY_OPTIONS = [
  { id: 'COURIER', label: 'Kurier DHL (1–2 dni robocze)', cost: 1499 },
  { id: 'PARCEL_LOCKER', label: 'Paczkomat InPost (2–3 dni robocze)', cost: 999 },
] as const

export type DeliveryMethod = (typeof DELIVERY_OPTIONS)[number]['id']

/** Próg na darmową dostawę kurierem DHL (w groszach) */
export const FREE_DELIVERY_THRESHOLD = 30000 // 300 zł

/**
 * Oblicza koszt dostawy na podstawie sumy produktów.
 * Jeśli suma >= 300 zł i metoda to COURIER, zwraca 0 (gratis).
 * Paczkomat zawsze kosztuje 9,99 zł.
 */
export function calculateDeliveryCost(subtotal: number, method: DeliveryMethod): number {
  if (method === 'COURIER' && subtotal >= FREE_DELIVERY_THRESHOLD) {
    return 0
  }
  const option = DELIVERY_OPTIONS.find((o) => o.id === method)
  return option?.cost ?? 0
}
