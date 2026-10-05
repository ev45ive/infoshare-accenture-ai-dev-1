import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { getProducts, getProduct } from '../../lib/products'
import { db } from '../../lib/db'

after(async () => { await db.$disconnect() })
test('katalog filtruje dostępność na prawdziwej bazie fixtures', async () => {
  const all = await getProducts()
  const available = await getProducts({ inStock: true })
  assert.equal(all.total, 12)
  assert.equal(available.total, 11)
  assert.ok(available.items.every((item) => item.stock > 0))
})
test('kategoria, sortowanie i paginacja dają spójny wynik', async () => {
  const result = await getProducts({ categorySlug: 'elektronika', sort: 'price_asc', perPage: 2, page: 1 })
  assert.equal(result.total, 4)
  assert.equal(result.totalPages, 2)
  assert.equal(result.items.length, 2)
  assert.equal(result.items[0].slug, 'powerbank-ultracharge-20000')
  assert.equal(result.hasNext, true)
  assert.equal(result.hasPrev, false)
})
test('szczegóły produktu zawierają warianty i obsługują brak produktu', async () => {
  const product = await getProduct('tshirt-basictee')
  assert.equal(product?.variants.length, 5)
  assert.equal(await getProduct('nonexistent-fixture-product'), null)
})
