'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { ResetPasswordConfirmSchema, type ResetPasswordConfirmInput } from '@/lib/validations/auth'

function ConfirmForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [serverMsg, setServerMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordConfirmInput>({
    resolver: zodResolver(ResetPasswordConfirmSchema),
    defaultValues: { token },
  })

  async function onSubmit(data: ResetPasswordConfirmInput) {
    setLoading(true)
    setServerMsg('')
    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (res.ok) {
        setDone(true)
      } else {
        setServerMsg(typeof body.error === 'string' ? body.error : 'Błąd. Spróbuj ponownie.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600 text-sm">Brak tokenu. Użyj linku z e-maila.</p>
        <Link href="/reset-password" className="text-blue-600 hover:underline text-sm">
          Wygeneruj nowy link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div role="status" className="rounded bg-green-50 p-4 text-sm text-green-700">
          ✅ Hasło zostało zmienione!
        </div>
        <Link href="/login" className="text-blue-600 hover:underline text-sm block">
          Zaloguj się nowym hasłem
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-center text-2xl font-bold">Nowe hasło</h1>

      {serverMsg && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {serverMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <input type="hidden" {...register('token')} />

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Nowe hasło
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">Min. 8 znaków, 1 cyfra, 1 znak specjalny</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Powtórz hasło
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Zapisywanie…' : 'Ustaw nowe hasło'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <Suspense>
          <ConfirmForm />
        </Suspense>
      </div>
    </div>
  )
}
