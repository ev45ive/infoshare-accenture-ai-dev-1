import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { ResetPasswordRequestSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Nieprawidłowy JSON.' }, { status: 400 })

  const parsed = ResetPasswordRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nieprawidłowy format e-mail.' }, { status: 400 })
  }

  const { email } = parsed.data

  // Zawsze zwracamy sukces — nie ujawniamy czy email istnieje (security)
  const SUCCESS = { success: true, message: 'Jeśli konto istnieje, wyślemy link do resetowania hasła.' }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json(SUCCESS)

  // Usuń poprzednie tokeny
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 60 * 60_000) // 1 godzina (BR-06)

  await db.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/reset-password/confirm?token=${token}`

  sendEmail({
    to: email,
    subject: '🔑 Reset hasła w ShopEasy',
    html: `
      <h2>Reset hasła</h2>
      <p>Otrzymaliśmy prośbę o reset hasła dla konta ${email}.</p>
      <p>Kliknij link poniżej (ważny 1 godzinę):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Jeśli to nie Ty, zignoruj tę wiadomość.</p>
    `,
  })

  return NextResponse.json(SUCCESS)
}
