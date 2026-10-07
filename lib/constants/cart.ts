export const MAX_ITEM_QUANTITY = 10

export type CheckoutCartItem = { productId: string; quantity: number; stock: number }

export type CheckoutCartIssues = {
  remove: string[]
  clamp: { productId: string; quantity: number }[]
}

export function getItemLimit(stock: number): number {
  return Math.min(MAX_ITEM_QUANTITY, stock)
}

export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0
}

export const INVALID_QUANTITY_MESSAGE = 'Nieprawidłowa ilość.'

export function getLimitExceededMessage(stock: number): string {
  return `Maksymalnie ${getItemLimit(stock)} szt. tego produktu (dostępne: ${stock}).`
}

// Produkt o stanie 0 nie jest przycinany do 0: checkout usunie go i tak.
export function getMergedQuantity(existing: number | undefined, incoming: number, stock: number): number {
  const limit = stock === 0 ? MAX_ITEM_QUANTITY : getItemLimit(stock)
  return Math.min(Math.max(existing ?? 0, incoming), limit)
}

export function classifyCheckoutItems(items: readonly CheckoutCartItem[]): CheckoutCartIssues {
  const remove: string[] = []
  const clamp: CheckoutCartIssues['clamp'] = []

  for (const item of items) {
    if (item.stock === 0) {
      remove.push(item.productId)
    } else if (item.quantity > getItemLimit(item.stock)) {
      clamp.push({ productId: item.productId, quantity: getItemLimit(item.stock) })
    }
  }

  return { remove, clamp }
}
