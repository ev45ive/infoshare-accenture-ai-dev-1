import type { MockEmail } from '@/types'

// global pattern — przeżywa Next.js HMR hot-reload
const g = global as typeof globalThis & { _emailStore?: MockEmail[] }
if (!g._emailStore) g._emailStore = []

export function sendEmail(params: Omit<MockEmail, 'id' | 'sentAt'>): MockEmail {
  const email: MockEmail = {
    ...params,
    id: crypto.randomUUID(),
    sentAt: new Date(),
  }
  g._emailStore!.push(email)
  return email
}

export function getAllEmails(): MockEmail[] {
  return [...(g._emailStore ?? [])]
}

export function getEmailsTo(to: string): MockEmail[] {
  return (g._emailStore ?? []).filter((e) => e.to === to)
}

export function clearEmails(): void {
  g._emailStore = []
}
