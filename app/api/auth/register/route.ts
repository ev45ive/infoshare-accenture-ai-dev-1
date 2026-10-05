import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { RegisterSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Nieprawidłowy JSON.' }, { status: 400 })

  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Ten adres e-mail jest już zarejestrowany.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const verificationToken = crypto.randomUUID()

  const user = await db.user.create({
    data: { name, email, passwordHash, verificationToken },
  })

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}`

  sendEmail({
    to: email,
    subject: '✉️ Potwierdź rejestrację w ShopEasy',
    html: `
      <h2>Witaj ${name}!</h2>
      <p>Kliknij link poniżej, aby aktywować konto ShopEasy:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Link jest ważny 24 godziny.</p>
      <p><em>— Zespół ShopEasy</em></p>
    `,
  })

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
}
