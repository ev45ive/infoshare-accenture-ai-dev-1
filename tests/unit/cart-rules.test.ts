import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_ITEM_QUANTITY,
  getItemLimit,
  isValidQuantity,
  getLimitExceededMessage,
  getMergedQuantity,
  classifyCheckoutItems,
} from '../../lib/constants/cart'

// ─── getItemLimit ───────────────────────────────────────────────────

test('maksymalna ilość jednego produktu wynosi 10', () => {
  assert.equal(MAX_ITEM_QUANTITY, 10)
})

test('limit to mniejsza z wartości: 10 i stan magazynowy', () => {
  assert.equal(getItemLimit(0), 0)
  assert.equal(getItemLimit(7), 7)
  assert.equal(getItemLimit(10), 10)
  assert.equal(getItemLimit(25), 10)
})

// ─── isValidQuantity ────────────────────────────────────────────────

test('poprawna ilość to dodatnia liczba całkowita', () => {
  assert.equal(isValidQuantity(1), true)
  assert.equal(isValidQuantity(10), true)
})

test('zero, ujemna, ułamek i NaN to nieprawidłowa ilość', () => {
  assert.equal(isValidQuantity(0), false)
  assert.equal(isValidQuantity(-1), false)
  assert.equal(isValidQuantity(1.5), false)
  assert.equal(isValidQuantity(Number.NaN), false)
  assert.equal(isValidQuantity(Number.POSITIVE_INFINITY), false)
})

// ─── getLimitExceededMessage ────────────────────────────────────────

test('komunikat zawiera limit i dostępną ilość', () => {
  assert.equal(getLimitExceededMessage(4), 'Maksymalnie 4 szt. tego produktu (dostępne: 4).')
  assert.equal(getLimitExceededMessage(25), 'Maksymalnie 10 szt. tego produktu (dostępne: 25).')
})

// ─── getMergedQuantity ──────────────────────────────────────────────

test('nowa pozycja w merge zachowuje ilość gościa w limicie', () => {
  assert.equal(getMergedQuantity(undefined, 3, 20), 3)
})

test('merge bierze większą z ilości konta i gościa', () => {
  assert.equal(getMergedQuantity(2, 5, 20), 5)
  assert.equal(getMergedQuantity(6, 5, 20), 6)
})

test('merge przycina wynik do 10 i do stanu', () => {
  assert.equal(getMergedQuantity(undefined, 15, 20), 10)
  assert.equal(getMergedQuantity(2, 9, 7), 7)
  assert.equal(getMergedQuantity(12, 3, 20), 10)
})

test('merge produktu o stanie 0 nie przycina do 0, tylko do 10', () => {
  assert.equal(getMergedQuantity(undefined, 3, 0), 3)
  assert.equal(getMergedQuantity(undefined, 15, 0), 10)
})

// ─── classifyCheckoutItems ──────────────────────────────────────────

test('checkout: pusty koszyk nie ma problemów', () => {
  assert.deepEqual(classifyCheckoutItems([]), { remove: [], clamp: [] })
})

test('checkout: pozycje w limicie, także dokładnie na limicie, są bez zmian', () => {
  const items = [
    { productId: 'a', quantity: 10, stock: 20 },
    { productId: 'b', quantity: 7, stock: 7 },
  ]
  assert.deepEqual(classifyCheckoutItems(items), { remove: [], clamp: [] })
})

test('checkout: pozycja ze stanem 0 jest do usunięcia, nie do przycięcia', () => {
  assert.deepEqual(classifyCheckoutItems([{ productId: 'a', quantity: 3, stock: 0 }]), {
    remove: ['a'],
    clamp: [],
  })
})

test('checkout: ilość ponad 10 lub ponad stan jest przycinana do limitu', () => {
  const items = [
    { productId: 'a', quantity: 11, stock: 20 },
    { productId: 'b', quantity: 8, stock: 7 },
  ]
  assert.deepEqual(classifyCheckoutItems(items), {
    remove: [],
    clamp: [
      { productId: 'a', quantity: 10 },
      { productId: 'b', quantity: 7 },
    ],
  })
})

test('checkout: stan 0 i ilość ponad limit w jednym koszyku są rozdzielone', () => {
  const items = [
    { productId: 'a', quantity: 2, stock: 0 },
    { productId: 'b', quantity: 12, stock: 30 },
    { productId: 'c', quantity: 1, stock: 5 },
  ]
  assert.deepEqual(classifyCheckoutItems(items), {
    remove: ['a'],
    clamp: [{ productId: 'b', quantity: 10 }],
  })
})
