import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'

export async function GET() {
  return NextResponse.json({ user: await getSessionUser() }, { headers: { 'Cache-Control': 'no-store' } })
}
