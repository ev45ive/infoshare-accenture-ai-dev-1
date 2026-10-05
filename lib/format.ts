/** Pure formatting helpers — no server-only imports, safe to use in Client Components */

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })
}
