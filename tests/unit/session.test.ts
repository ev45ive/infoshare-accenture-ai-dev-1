import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encodeSession, decodeSession } from '../../lib/session-token'

process.env.SESSION_SECRET = 'local-unit-fixture-secret-with-at-least-32-characters'
const session = { user: { id: 'user-fixture', email: 'fixture@example.test', name: 'Fixture' }, expiresAt: 2000 }

test('podpisana sesja zachowuje tożsamość przed wygaśnięciem', () => {
  assert.deepEqual(decodeSession(encodeSession(session), 1000), session)
})
test('zmiana tożsamości bez nowego podpisu jest odrzucona', () => {
  const [, signature] = encodeSession(session).split('.')
  const forged = Buffer.from(JSON.stringify({ ...session, user: { ...session.user, id: 'other-user' } })).toString('base64url')
  assert.equal(decodeSession(`${forged}.${signature}`, 1000), null)
})
test('sesja wygasa dokładnie na granicy TTL', () => {
  assert.equal(decodeSession(encodeSession(session), 2000), null)
})
test('stare cookie JSON, pusty i uszkodzony token są odrzucone', () => {
  for (const value of [undefined, '', JSON.stringify(session), 'abc.def', 'a.b.c']) assert.equal(decodeSession(value, 1000), null)
})
test('reset sekretu unieważnia poprzednią sesję', () => {
  const original = process.env.SESSION_SECRET
  const token = encodeSession(session)
  process.env.SESSION_SECRET = 'different-local-unit-secret-at-least-32-characters'
  assert.equal(decodeSession(token, 1000), null)
  process.env.SESSION_SECRET = original
})
