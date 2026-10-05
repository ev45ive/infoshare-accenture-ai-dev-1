import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', base))
  }

  const user = await db.user.findFirst({ where: { verificationToken: token } })
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', base))
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  })

  return NextResponse.redirect(new URL('/login?verified=1', base))
}
