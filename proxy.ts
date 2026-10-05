import { NextRequest, NextResponse } from 'next/server'
import { decodeSession, SESSION_COOKIE } from '@/lib/session-token'

const PROTECTED_PREFIXES = ['/account', '/checkout']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const session = decodeSession(req.cookies.get(SESSION_COOKIE)?.value)
  if (!session) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*'],
}
