// Szkielet pod RED: sygnatury bez zachowania.
export function getItemLimit(stock?: number): number {
  throw new Error('not implemented')
}

export function canIncrease(quantity: number, stock?: number): boolean {
  throw new Error('not implemented')
}

export function canDecrease(quantity: number): boolean {
  throw new Error('not implemented')
}

export function isUnavailable(stock?: number): boolean {
  throw new Error('not implemented')
}
