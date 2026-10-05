'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ResetPasswordRequestSchema, type ResetPasswordRequestInput } from '@/lib/validations/auth'

export default function ResetPasswordPage() {
  const [serverMsg, setServerMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(ResetPasswordRequestSchema),
  })

  async function onSubmit(data: ResetPasswordRequestInput) {
    setLoading(true)
    setServerMsg('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (res.ok) {
        setSent(true)
        setServerMsg(body.message)
      } else {
        setServerMsg(body.error ?? 'Wystąpił błąd.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-bold">Reset hasła</h1>

        {sent ? (
          <div className="space-y-4 text-center">
            <div role="status" className="rounded bg-green-50 p-4 text-sm text-green-700">
              📧 {serverMsg}
            </div>
            <p className="text-xs text-gray-400">
              Sprawdź{' '}
              <Link href="/debug/emails" className="text-blue-600 hover:underline">
                /debug/emails
              </Link>{' '}
              aby zobaczyć link (środowisko dev).
            </p>
            <Link href="/login" className="block text-sm text-blue-600 hover:underline">
              Wróć do logowania
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Podaj adres e-mail konta. Wyślemy link do ustawienia nowego hasła (ważny 1 godz.).
            </p>

            {serverMsg && !sent && (
              <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
                {serverMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Wysyłanie…' : 'Wyślij link resetujący'}
              </button>
            </form>

            <p className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                Wróć do logowania
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
