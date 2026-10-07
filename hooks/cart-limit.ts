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
