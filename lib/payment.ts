import type { PaymentMockMode, PaymentResult } from '@/types'

export async function processPayment(amountCents: number): Promise<PaymentResult> {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error('Kwota płatności musi być dodatnią liczbą groszy.')
  const mode = (process.env.PAYMENT_MOCK_MODE ?? 'normal') as PaymentMockMode

  if (mode === 'always_fail') {
    return {
      success: false,
      code: 'CARD_DECLINED',
      message: 'Karta odrzucona przez bank.',
    }
  }

  if (mode === 'always_timeout') {
    const delay = Number(process.env.PAYMENT_TIMEOUT_MS ?? 250)
    if (!Number.isFinite(delay) || delay < 0 || delay > 5000) throw new Error('Nieprawidłowy PAYMENT_TIMEOUT_MS.')
    await new Promise((resolve) => setTimeout(resolve, delay))
    return {
      success: false,
      code: 'TIMEOUT',
      message: 'Przekroczono czas oczekiwania na odpowiedź bramki.',
    }
  }

  // normal: zawsze sukces w warsztacie (PAYMENT_MOCK_MODE=always_fail do testowania błędów)
  return {
    success: true,
    transactionId: `TXN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  }
}
