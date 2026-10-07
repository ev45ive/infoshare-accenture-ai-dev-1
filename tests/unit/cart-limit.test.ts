import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getItemLimit, canIncrease, canDecrease, isUnavailable } from '../../hooks/cart-limit'

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
