import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { ResetPasswordConfirmSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Nieprawidłowy JSON.' }, { status: 400 })

  const parsed = ResetPasswordConfirmSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { token, password } = parsed.data

  const resetToken = await db.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken || resetToken.used) {
    return NextResponse.json({ error: 'Nieprawidłowy lub wykorzystany token.' }, { status: 400 })
  }

  if (resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link do resetowania hasła wygasł. Wygeneruj nowy.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  })

  await db.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  })

  return NextResponse.json({ success: true })
}
