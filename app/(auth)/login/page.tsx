'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginSchema, type LoginInput } from '@/lib/validations/auth'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const verified = params.get('verified') === '1'
  const errorParam = params.get('error')
  const nextPath = params.get('next') ?? '/'

  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push(nextPath)
        router.refresh()
      } else {
        const body = await res.json()
        setServerError(body.error ?? 'Błąd logowania. Spróbuj ponownie.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow">
      <h1 className="text-center text-2xl font-bold">Zaloguj się</h1>

      {verified && (
        <div role="status" className="rounded bg-green-50 p-3 text-sm text-green-700">
          ✅ Konto zostało aktywowane! Możesz się zalogować.
        </div>
      )}

      {errorParam === 'invalid_token' && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          Link weryfikacyjny jest nieprawidłowy lub wygasł.
        </div>
      )}

      {serverError && (
        <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {serverError}
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

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Hasło
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logowanie…' : 'Zaloguj się'}
        </button>
      </form>

      <div className="space-y-1 text-center text-sm">
        <p>
          <Link href="/reset-password" className="text-blue-600 hover:underline">
            Zapomniałeś hasła?
          </Link>
        </p>
        <p>
          Nie masz konta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
