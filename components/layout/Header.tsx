import Link from 'next/link'
import { getSessionUser } from '@/lib/session'
import { LogoutButton } from './LogoutButton'

export async function Header() {
  const user = await getSessionUser()

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          ShopEasy
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/products" className="text-gray-700 hover:text-blue-600">
            Produkty
          </Link>
          <Link href="/cart" className="text-gray-700 hover:text-blue-600">
            🛒 Koszyk
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/account/profile" className="text-gray-700 hover:text-blue-600">
                👤 {user.name}
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
              >
                Zarejestruj
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
