import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateDeliveryCost, FREE_DELIVERY_THRESHOLD } from '../../lib/constants/checkout'

// ─── Testy dla calculateDeliveryCost ────────────────────────────────

test('kurier DHL poniżej progu (299,99 zł) zwraca cenę bazową 14,99 zł', () => {
  const cost = calculateDeliveryCost(29999, 'COURIER')
  assert.equal(cost, 1499)
})

test('kurier DHL dokładnie na progu (300,00 zł) zwraca 0 (gratis)', () => {
  const cost = calculateDeliveryCost(30000, 'COURIER')
  assert.equal(cost, 0)
})

test('kurier DHL powyżej progu (300,01 zł) zwraca 0 (gratis)', () => {
  const cost = calculateDeliveryCost(30001, 'COURIER')
  assert.equal(cost, 0)
})

test('kurier DHL ze znacznie wyższą sumą (500,00 zł) zwraca 0 (gratis)', () => {
  const cost = calculateDeliveryCost(50000, 'COURIER')
  assert.equal(cost, 0)
})

test('paczkomat poniżej progu (100,00 zł) zwraca cenę bazową 9,99 zł', () => {
  const cost = calculateDeliveryCost(10000, 'PARCEL_LOCKER')
  assert.equal(cost, 999)
})

test('paczkomat dokładnie na progu (300,00 zł) zwraca 9,99 zł (nie gratis)', () => {
  const cost = calculateDeliveryCost(30000, 'PARCEL_LOCKER')
  assert.equal(cost, 999)
})

test('paczkomat ze znacznie wyższą sumą (500,00 zł) zwraca 9,99 zł (nie gratis)', () => {
  const cost = calculateDeliveryCost(50000, 'PARCEL_LOCKER')
  assert.equal(cost, 999)
})

test('próg darmowej dostawy wynosi 30000 gr (300,00 zł)', () => {
  assert.equal(FREE_DELIVERY_THRESHOLD, 30000)
})

test('suma 0 gr zwraca koszt dostawy (bez przystępu do progu)', () => {
  const cost = calculateDeliveryCost(0, 'COURIER')
  assert.equal(cost, 1499)
})
