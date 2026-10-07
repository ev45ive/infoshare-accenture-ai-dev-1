import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { addToCart, updateCartQuantity } from '../../lib/cart'
import { db } from '../../lib/db'

// Własny użytkownik, bo checkout.test.ts używa test@shopeasy.pl, a pliki testów działają równolegle.
const USER_EMAIL = 'limit-test@shopeasy.pl'

let userId: string

async function cleanupUser() {
  const user = await db.user.findUnique({ where: { email: USER_EMAIL } })
  if (!user) return
  await db.order.deleteMany({ where: { userId: user.id } })
  await db.user.delete({ where: { id: user.id } })
}

async function setCart(items: { productId: string; quantity: number }[]) {
  await db.cartItem.deleteMany({ where: { userId } })
  await db.cartItem.createMany({ data: items.map((i) => ({ userId, ...i })) })
}

async function cartQuantity(productId: string) {
  const item = await db.cartItem.findUnique({ where: { userId_productId: { userId, productId } } })
  return item?.quantity
}

const bySlug = (slug: string) => db.product.findUniqueOrThrow({ where: { slug } })

before(async () => {
  await cleanupUser()
  const user = await db.user.create({ data: { email: USER_EMAIL, name: 'Limit Test', passwordHash: 'x' } })
  userId = user.id
})

after(async () => {
  await cleanupUser()
  await db.$disconnect()
})

// ─── addToCart ──────────────────────────────────────────────────────

test('dodanie 11 szt. produktu o dużym stanie jest odrzucone, koszyk bez zmian', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  assert.ok(product.stock > 10)
  await setCart([])

  const result = await addToCart(userId, product.id, 11)

  assert.deepEqual(result, { error: `Maksymalnie 10 szt. tego produktu (dostępne: ${product.stock}).` })
  assert.equal(await cartQuantity(product.id), undefined)
})

test('dodanie do dokładnie 10 szt. jest dozwolone i zapisuje ilość', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  await setCart([{ productId: product.id, quantity: 9 }])

  const result = await addToCart(userId, product.id, 1)

  assert.equal(result.success, true)
  assert.equal(await cartQuantity(product.id), 10)
})

test('kumulacja istniejącej i dodawanej ilości ponad 10 jest odrzucona', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  await setCart([{ productId: product.id, quantity: 9 }])

  const result = await addToCart(userId, product.id, 2)

  assert.ok(result.error)
  assert.equal(await cartQuantity(product.id), 9)
})

test('dodanie ponad stan jest odrzucone z limitem równym stanowi', async () => {
  const product = await bySlug('ekspres-brewmaster-500')
  assert.ok(product.stock > 0 && product.stock < 10)
  await setCart([])

  const result = await addToCart(userId, product.id, product.stock + 1)

  assert.deepEqual(result, {
    error: `Maksymalnie ${product.stock} szt. tego produktu (dostępne: ${product.stock}).`,
  })
  assert.equal(await cartQuantity(product.id), undefined)
})

test('nieprawidłowa ilość przy dodaniu jest odrzucona', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  await setCart([])

  for (const quantity of [0, -1, 1.5, Number.NaN]) {
    const result = await addToCart(userId, product.id, quantity)
    assert.deepEqual(result, { error: 'Nieprawidłowa ilość.' })
  }

  assert.equal(await cartQuantity(product.id), undefined)
})

// ─── updateCartQuantity ─────────────────────────────────────────────

test('zmiana ilości ponad 10 jest odrzucona, ilość bez zmian', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  await setCart([{ productId: product.id, quantity: 5 }])

  const result = await updateCartQuantity(userId, product.id, 11)

  assert.ok(result.error)
  assert.equal(await cartQuantity(product.id), 5)
})

test('zmiana ilości ponad stan jest odrzucona, ilość bez zmian', async () => {
  const product = await bySlug('ekspres-brewmaster-500')
  await setCart([{ productId: product.id, quantity: 1 }])

  const result = await updateCartQuantity(userId, product.id, product.stock + 1)

  assert.ok(result.error)
  assert.equal(await cartQuantity(product.id), 1)
})

test('pozycja już ponad limit: zmniejszenie dozwolone, zwiększenie zablokowane', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  await setCart([{ productId: product.id, quantity: 12 }])

  const decreased = await updateCartQuantity(userId, product.id, 11)
  const increased = await updateCartQuantity(userId, product.id, 12)

  assert.equal(decreased.success, true)
  assert.ok(increased.error)
  assert.equal(await cartQuantity(product.id), 11)
})

test('nieprawidłowa ilość przy zmianie jest odrzucona, ilość bez zmian', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  await setCart([{ productId: product.id, quantity: 3 }])

  for (const quantity of [1.5, Number.NaN]) {
    const result = await updateCartQuantity(userId, product.id, quantity)
    assert.deepEqual(result, { error: 'Nieprawidłowa ilość.' })
  }

  assert.equal(await cartQuantity(product.id), 3)
})

test('ilość 0 przy zmianie usuwa pozycję', async () => {
  const product = await bySlug('powerbank-ultracharge-20000')
  await setCart([{ productId: product.id, quantity: 3 }])

  const result = await updateCartQuantity(userId, product.id, 0)

  assert.equal(result.success, true)
  assert.equal(await cartQuantity(product.id), undefined)
})
