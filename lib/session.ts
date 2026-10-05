import { cookies } from 'next/headers'
import type { SessionCookie, SessionUser } from '@/types'
import { SESSION_COOKIE, SESSION_TTL_MS, decodeSession, encodeSession } from './session-token'

export async function getSession(): Promise<SessionCookie | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  return decodeSession(raw)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function setSession(user: SessionUser): Promise<void> {
  const store = await cookies()
  const session: SessionCookie = {
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
  store.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.WORKSHOP_MODE !== 'true' && process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
