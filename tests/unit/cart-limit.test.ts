import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  getItemLimit,
  canIncrease,
  canDecrease,
  isUnavailable,
  getLimitMessage,
  checkGuestAdd,
  checkGuestUpdate,
} from '../../hooks/cart-limit'

// ─── getItemLimit ───────────────────────────────────────────────────

test('limit bez znanego stanu (gość) wynosi 10', () => {
  assert.equal(getItemLimit(), 10)
})

test('limit przy stanie powyżej 10 wynosi 10', () => {
  assert.equal(getItemLimit(25), 10)
})

test('limit przy stanie dokładnie 10 wynosi 10', () => {
  assert.equal(getItemLimit(10), 10)
})

test('limit przy stanie poniżej 10 równa się stanowi', () => {
  assert.equal(getItemLimit(4), 4)
})

test('limit przy stanie 0 wynosi 0', () => {
  assert.equal(getItemLimit(0), 0)
})

// ─── canIncrease ────────────────────────────────────────────────────

test('zwiększanie dozwolone poniżej limitu 10 (gość)', () => {
  assert.equal(canIncrease(1), true)
  assert.equal(canIncrease(9), true)
})

test('zwiększanie zablokowane na limicie 10 i powyżej (gość)', () => {
  assert.equal(canIncrease(10), false)
  assert.equal(canIncrease(11), false)
})

test('zwiększanie respektuje stan poniżej 10', () => {
  assert.equal(canIncrease(3, 4), true)
  assert.equal(canIncrease(4, 4), false)
  assert.equal(canIncrease(5, 4), false)
})

test('zwiększanie zablokowane przy stanie 0', () => {
  assert.equal(canIncrease(1, 0), false)
})

// ─── canDecrease ────────────────────────────────────────────────────

test('zmniejszanie zablokowane przy ilości 1', () => {
  assert.equal(canDecrease(1), false)
})

test('zmniejszanie dozwolone przy ilości powyżej 1', () => {
  assert.equal(canDecrease(2), true)
})

test('zmniejszanie dozwolone dla pozycji ponad limit', () => {
  assert.equal(canDecrease(15), true)
})

// ─── isUnavailable ──────────────────────────────────────────────────

test('niedostępny tylko przy stanie 0', () => {
  assert.equal(isUnavailable(0), true)
  assert.equal(isUnavailable(1), false)
})

test('brak znanego stanu (gość) nie oznacza niedostępności', () => {
  assert.equal(isUnavailable(), false)
})

// ─── getLimitMessage ───────────────────────────────────────────────────────

test('komunikat bez znanego stanu zawiera tylko limit 10', () => {
  assert.equal(getLimitMessage(), 'Maksymalnie 10 szt. tego produktu.')
})

test('komunikat ze stanem zawiera limit i dostępną ilość', () => {
  assert.equal(getLimitMessage(4), 'Maksymalnie 4 szt. tego produktu (dostępne: 4).')
})

// ─── checkGuestAdd ────────────────────────────────────────────────────

test('dodanie do pustego koszyka gościa w limicie jest dozwolone', () => {
  assert.deepEqual(checkGuestAdd([], 'a', 1), { ok: true })
})

test('dodanie do istniejącej pozycji do dokładnie 10 jest dozwolone', () => {
  assert.deepEqual(checkGuestAdd([{ productId: 'a', quantity: 9 }], 'a', 1), { ok: true })
})

test('dodanie do istniejącej pozycji ponad 10 jest odrzucone z komunikatem', () => {
  assert.deepEqual(checkGuestAdd([{ productId: 'a', quantity: 9 }], 'a', 2), {
    ok: false,
    error: 'Maksymalnie 10 szt. tego produktu.',
  })
})

test('dodanie nowej pozycji z ilością 11 jest odrzucone', () => {
  assert.deepEqual(checkGuestAdd([], 'a', 11), {
    ok: false,
    error: 'Maksymalnie 10 szt. tego produktu.',
  })
})

test('ilość innego produktu nie wlicza się do limitu', () => {
  assert.deepEqual(checkGuestAdd([{ productId: 'a', quantity: 10 }], 'b', 1), { ok: true })
})

// ─── checkGuestUpdate ───────────────────────────────────────────────────

test('zwiększenie ilości do limitu 10 jest dozwolone', () => {
  assert.deepEqual(checkGuestUpdate(5, 6), { ok: true })
  assert.deepEqual(checkGuestUpdate(5, 10), { ok: true })
})

test('zwiększenie ilości ponad 10 jest odrzucone z komunikatem', () => {
  const expected = { ok: false, error: 'Maksymalnie 10 szt. tego produktu.' }
  assert.deepEqual(checkGuestUpdate(10, 11), expected)
  assert.deepEqual(checkGuestUpdate(5, 11), expected)
})

test('zmniejszenie ilości jest dozwolone także dla pozycji ponad limit', () => {
  assert.deepEqual(checkGuestUpdate(12, 11), { ok: true })
  assert.deepEqual(checkGuestUpdate(12, 12), { ok: true })
})

test('zwiększenie pozycji ponad limit jest odrzucone', () => {
  assert.deepEqual(checkGuestUpdate(12, 13), {
    ok: false,
    error: 'Maksymalnie 10 szt. tego produktu.',
  })
})
