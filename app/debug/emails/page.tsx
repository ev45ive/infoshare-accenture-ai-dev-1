import { redirect } from 'next/navigation'
import { getAllEmails } from '@/lib/email'

export const dynamic = 'force-dynamic'

export default function DebugEmailsPage() {
  if (process.env.WORKSHOP_MODE !== 'true') redirect('/')

  const emails = getAllEmails()

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📬 Debug: Mock Emails</h1>
        <span className="text-sm text-gray-500">{emails.length} wiadomości</span>
      </div>

      {emails.length === 0 ? (
        <p className="text-gray-500 text-sm">Brak wiadomości. Zarejestruj się lub zresetuj hasło.</p>
      ) : (
        <div className="space-y-4">
          {[...emails].reverse().map((email) => (
            <div key={email.id} className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  <strong>Do:</strong> {email.to}
                </span>
                <span>{email.sentAt.toLocaleString('pl-PL')}</span>
              </div>
              <p className="font-semibold text-sm">{email.subject}</p>
              <div
                className="text-sm text-gray-700 border-t pt-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: email.html }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
