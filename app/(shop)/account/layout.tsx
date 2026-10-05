import Link from 'next/link'
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login?next=/account/profile')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-2 text-sm text-gray-500 mb-6">
        <span>Moje konto</span>
        <span>·</span>
        <span className="font-medium text-gray-900">{user.name}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <nav className="md:col-span-1">
          <ul className="space-y-1">
            {[
              { href: '/account/profile', label: 'Profil' },
              { href: '/account/orders', label: 'Historia zamówień' },
              { href: '/account/loyalty', label: 'Program lojalnościowy' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  )
}
