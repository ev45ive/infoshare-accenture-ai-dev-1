import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user) redirect('/login?next=/account/profile')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profil</h1>
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Imię i nazwisko</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adres e-mail</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ID konta</p>
          <p className="font-mono text-sm text-gray-500">{user.id}</p>
        </div>
        <p className="text-sm text-gray-400 italic">
          Edycja profilu dostępna w pełnej wersji aplikacji.
        </p>
      </div>
    </div>
  )
}
