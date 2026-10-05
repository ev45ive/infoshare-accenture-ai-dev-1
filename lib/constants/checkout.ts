export const DELIVERY_OPTIONS = [
  { id: 'COURIER', label: 'Kurier DHL (1–2 dni robocze)', cost: 1499 },
  { id: 'PARCEL_LOCKER', label: 'Paczkomat InPost (2–3 dni robocze)', cost: 999 },
] as const

export type DeliveryMethod = (typeof DELIVERY_OPTIONS)[number]['id']
