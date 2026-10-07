import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getOrderErrorTitle } from '../../hooks/order-error'

test('błąd z kodem płatności ma tytuł "Błąd płatności"', () => {
  assert.equal(getOrderErrorTitle({ code: 'CARD_DECLINED' }), 'Błąd płatności')
  assert.equal(getOrderErrorTitle({ code: 'TIMEOUT' }), 'Błąd płatności')
})

test('błąd bez kodu (np. koszyk) ma tytuł "Nie udało się złożyć zamówienia"', () => {
  assert.equal(getOrderErrorTitle({}), 'Nie udało się złożyć zamówienia')
})
