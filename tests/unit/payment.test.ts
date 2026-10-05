import { test } from 'node:test'
import assert from 'node:assert/strict'
import { processPayment } from '../../lib/payment'
import { AddressSchema, BlikSchema } from '../../lib/validations/checkout'
import { formatPrice } from '../../lib/format'

test('normalny mock zwraca identyfikator transakcji', async () => {
  process.env.PAYMENT_MOCK_MODE = 'normal'
  const result = await processPayment(31498)
  assert.equal(result.success, true)
  if (result.success) assert.match(result.transactionId, /^TXN-/)
})
test('mock odrzuca nieprawidłową kwotę przed przetwarzaniem', async () => {
  for (const amount of [0, -1, 1.5, NaN]) await assert.rejects(processPayment(amount), /liczbą groszy/)
})
test('odmowa mocka jest jawnym błędem', async () => {
  process.env.PAYMENT_MOCK_MODE = 'always_fail'
  const result = await processPayment(31498)
  assert.equal(result.success, false)
  if (!result.success) assert.equal(result.code, 'CARD_DECLINED')
})
test('timeout można odtworzyć bez oczekiwania 35 sekund', async () => {
  process.env.PAYMENT_MOCK_MODE = 'always_timeout'
  process.env.PAYMENT_TIMEOUT_MS = '1'
  const result = await processPayment(31498)
  assert.equal(result.success, false)
  if (!result.success) assert.equal(result.code, 'TIMEOUT')
})
test('format ceny zachowuje grosze', () => {
  assert.match(formatPrice(31498).replaceAll('\u00a0', ' '), /^314,98 zł$/)
})
test('dane dostawy i BLIK odrzucają błędny format', () => {
  const address = { firstName: 'Jan', lastName: 'Testowy', street: 'Testowa 12', city: 'Warszawa', postalCode: '00-001', phone: '600000000' }
  assert.equal(AddressSchema.safeParse(address).success, true)
  assert.equal(AddressSchema.safeParse({ ...address, postalCode: '00001' }).success, false)
  assert.equal(BlikSchema.safeParse({ code: '123456' }).success, true)
  assert.equal(BlikSchema.safeParse({ code: '12345' }).success, false)
})
