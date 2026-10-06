import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateDeliveryCost, calculateOrderTotals, FREE_DELIVERY_THRESHOLD } from '../../lib/constants/checkout'
import { formatDeliveryCost, formatPrice } from '../../lib/format'

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

// ─── Testy dla calculateOrderTotals ─────────────────────────────────

test('suma liczona z cen i ilości; kurier na progu z wielu pozycji jest gratis', () => {
  const totals = calculateOrderTotals(
    [{ price: 15000, quantity: 1 }, { price: 7500, quantity: 2 }],
    'COURIER',
  )
  assert.deepEqual(totals, { subtotal: 30000, deliveryCost: 0, total: 30000 })
})

test('kurier tuż poniżej progu dolicza 14,99 zł do total', () => {
  const totals = calculateOrderTotals([{ price: 29999, quantity: 1 }], 'COURIER')
  assert.deepEqual(totals, { subtotal: 29999, deliveryCost: 1499, total: 31498 })
})

test('paczkomat powyżej progu dolicza 9,99 zł do total', () => {
  const totals = calculateOrderTotals([{ price: 20000, quantity: 2 }], 'PARCEL_LOCKER')
  assert.deepEqual(totals, { subtotal: 40000, deliveryCost: 999, total: 40999 })
})

test('pusta lista pozycji daje subtotal 0 i koszt bazowy', () => {
  assert.deepEqual(calculateOrderTotals([], 'COURIER'), { subtotal: 0, deliveryCost: 1499, total: 1499 })
})

// ─── Testy dla formatDeliveryCost ───────────────────────────────────

test('koszt 0 gr jest wyświetlany jako Gratis', () => {
  assert.equal(formatDeliveryCost(0), 'Gratis')
})

test('koszt dodatni jest wyświetlany jako cena', () => {
  assert.equal(formatDeliveryCost(1499), formatPrice(1499))
})
