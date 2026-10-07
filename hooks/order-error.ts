import { CART_MESSAGES } from './cart-messages'

// Kod ma tylko błąd płatności; błędy koszyka go nie mają (kontrakt, Oczekiwania frontendu).
export function getOrderErrorTitle(result: { code?: string }): string {
  return result.code ? CART_MESSAGES.paymentErrorTitle : CART_MESSAGES.orderErrorTitle
}
