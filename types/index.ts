// ─── Sesja ──────────────────────────────────────────────

export type SessionUser = {
  id: string
  email: string
  name: string
}

export type SessionCookie = {
  user: SessionUser
  expiresAt: number // Unix timestamp ms
}

// ─── Koszyk (cookie dla gościa) ─────────────────────────

export type CartCookieItem = {
  productId: string
  quantity: number
}

// ─── Mock email ─────────────────────────────────────────

export type MockEmail = {
  id: string
  to: string
  subject: string
  html: string
  sentAt: Date
}

// ─── Płatność ───────────────────────────────────────────

export type PaymentResult =
  | { success: true; transactionId: string }
  | { success: false; code: string; message: string }

export type PaymentMockMode = 'normal' | 'always_fail' | 'always_timeout'
