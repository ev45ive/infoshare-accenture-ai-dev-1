import { NextRequest, NextResponse } from 'next/server'
import { clearSession } from '@/lib/session'
import { clearEmails } from '@/lib/email'

export async function POST(req: NextRequest) {
  if (process.env.WORKSHOP_MODE !== 'true' || !['localhost', '127.0.0.1'].includes(req.nextUrl.hostname)) {
    return NextResponse.json({ error: 'Niedostępne.' }, { status: 404 })
  }
  const origin = req.headers.get('origin')
  let sameOrigin = false
  try {
    const source = new URL(origin ?? '')
    sameOrigin = source.host === req.headers.get('host') && ['localhost', '127.0.0.1'].includes(source.hostname) && source.protocol === 'http:'
  } catch {}
  if (!sameOrigin) return NextResponse.json({ error: 'Niedozwolone źródło.' }, { status: 403 })
  await clearSession()
  clearEmails()
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
