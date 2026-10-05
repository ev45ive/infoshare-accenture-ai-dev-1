'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterInput } from '@/lib/validations/auth'

export default function RegisterPage() {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const body = await res.json()
        setServerError(
          typeof body.error === 'string'
            ? body.error
            : 'Błąd rejestracji. Sprawdź dane i spróbuj ponownie.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h1 className="text-xl font-bold">Sprawdź skrzynkę e-mail!</h1>
          <p className="text-sm text-gray-600">
            Wysłaliśmy link aktywacyjny. Kliknij go, aby aktywować konto.
          </p>
          <p className="text-xs text-gray-400">
            (Środowisko dev:{' '}
            <Link href="/debug/emails" className="text-blue-600 hover:underline">
              /debug/emails
            </Link>
            )
          </p>
          <Link href="/login" className="block text-sm text-blue-600 hover:underline">
            Przejdź do logowania
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-bold">Zarejestruj się</h1>

        {serverError && (
          <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Imię i nazwisko
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

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

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Hasło
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
            <p className="mt-1 text-xs text-gray-400">
              Min. 8 znaków, 1 cyfra, 1 znak specjalny
            </p>
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
            {loading ? 'Rejestrowanie…' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="text-center text-sm">
          Masz już konto?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  )
}
