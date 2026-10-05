import { createHmac, timingSafeEqual } from 'node:crypto'
import type { SessionCookie } from '@/types'

export const SESSION_COOKIE = 'shopeasy_session'
export const SESSION_TTL_MS = 30 * 60 * 1000

function secret() {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 32) throw new Error('SESSION_SECRET wymaga co najmniej 32 znaków.')
  return value
}

export function encodeSession(session: SessionCookie): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function decodeSession(raw: string | undefined, now = Date.now()): SessionCookie | null {
  if (!raw || raw.length > 4096) return null
  try {
    const parts = raw.split('.')
    if (parts.length !== 2) return null
    const [payload, signature] = parts
    const expected = createHmac('sha256', secret()).update(payload).digest()
    const supplied = Buffer.from(signature, 'base64url')
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!Number.isFinite(session.expiresAt) || session.expiresAt <= now) return null
    if (!session.user || ['id', 'email', 'name'].some((key) => typeof session.user[key] !== 'string' || !session.user[key])) return null
    return session as SessionCookie
  } catch {
    return null
  }
}
