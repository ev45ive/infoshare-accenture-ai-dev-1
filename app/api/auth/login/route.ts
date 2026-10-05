import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { setSession } from '@/lib/session'
import { LoginSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Nieprawidłowy JSON.' }, { status: 400 })

  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nieprawidłowe dane logowania.' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })

  // Generic error — nie ujawniamy czy email istnieje (security)
  const INVALID_MSG = 'Nieprawidłowy e-mail lub hasło.'

  if (!user) {
    return NextResponse.json({ error: INVALID_MSG }, { status: 401 })
  }

  // BR-05: blokada konta
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000)
    return NextResponse.json(
      { error: `Konto tymczasowo zablokowane. Spróbuj ponownie za ${minutesLeft} min.` },
      { status: 423 }
    )
  }

  // REG-03: wymaga aktywacji e-mail
  if (!user.emailVerified) {
    return NextResponse.json(
      { error: 'Konto nie zostało aktywowane. Sprawdź skrzynkę e-mail i kliknij link weryfikacyjny.' },
      { status: 403 }
    )
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash)

  if (!passwordOk) {
    const attempts = user.failedLoginAttempts + 1
    const shouldLock = attempts >= 5
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60_000) : null,
      },
    })

    if (shouldLock) {
      return NextResponse.json(
        { error: 'Konto zablokowane na 15 minut z powodu zbyt wielu nieudanych prób logowania.' },
        { status: 423 }
      )
    }

    const remaining = 5 - attempts
    return NextResponse.json(
      { error: `${INVALID_MSG} Pozostało prób przed blokadą: ${remaining}.` },
      { status: 401 }
    )
  }

  // Sukces — resetuj licznik błędów i ustaw sesję
  await db.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  })

  await setSession({ id: user.id, email: user.email, name: user.name })

  return NextResponse.json({ success: true })
}
