import { CART_MESSAGES } from './cart-messages'

const MAX_QUANTITY = 10

// Stan nieznany (koszyk gościa) oznacza limit bez ograniczenia stanem.
export function getItemLimit(stock?: number): number {
  return stock === undefined ? MAX_QUANTITY : Math.min(MAX_QUANTITY, stock)
}

export function canIncrease(quantity: number, stock?: number): boolean {
  return quantity < getItemLimit(stock)
}

export function canDecrease(quantity: number): boolean {
  return quantity > 1
}

export function isUnavailable(stock?: number): boolean {
  return stock === 0
}

export type LimitCheck = { ok: true } | { ok: false; error: string }

export function getLimitMessage(stock?: number): string {
  const limit = getItemLimit(stock)
  return stock === undefined
    ? CART_MESSAGES.itemsLimit(limit)
    : CART_MESSAGES.itemsLimitStock(limit, stock)
}

export function checkGuestAdd(
  items: { productId: string; quantity: number }[],
  productId: string,
  quantity: number,
): LimitCheck {
  const existing = items.find((i) => i.productId === productId)?.quantity ?? 0
  return existing + quantity > getItemLimit()
    ? { ok: false, error: getLimitMessage() }
    : { ok: true }
}

// Zmniejszenie jest zawsze dozwolone, także dla pozycji ponad limit.
export function checkGuestUpdate(currentQuantity: number, newQuantity: number): LimitCheck {
  return newQuantity > currentQuantity && newQuantity > getItemLimit()
    ? { ok: false, error: getLimitMessage() }
    : { ok: true }
}
