import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { placeOrder } from '../../lib/orders'
import { clearEmails, getEmailsTo } from '../../lib/email'
import { db } from '../../lib/db'

const USER_EMAIL = 'test@shopeasy.pl'
const ADDRESS = {
  firstName: 'Jan',
  lastName: 'Testowy',
  street: 'Testowa 1',
  city: 'Warszawa',
  postalCode: '00-001',
  phone: '123456789',
}

let orderId: string | undefined

before(async () => {
  clearEmails()
  await db.cartItem.deleteMany({ where: { user: { email: USER_EMAIL } } })
})

after(async () => {
  if (orderId) {
    const order = await db.order.findUnique({ where: { id: orderId } })
    await db.order.deleteMany({ where: { id: orderId } })
    if (order) await db.address.deleteMany({ where: { id: order.addressId } })
  }
  clearEmails()
  await db.$disconnect()
})

test('zamówienie kurierem >= 300 zł zapisuje deliveryCost 0 i wysyła mail z Gratis', async () => {
  const user = await db.user.findUniqueOrThrow({ where: { email: USER_EMAIL } })
  const mouse = await db.product.findUniqueOrThrow({ where: { slug: 'mysz-swiftclick-8k' } })
  const powerbank = await db.product.findUniqueOrThrow({ where: { slug: 'powerbank-ultracharge-20000' } })
  await db.cartItem.createMany({
    data: [
      { userId: user.id, productId: mouse.id, quantity: 1 },
      { userId: user.id, productId: powerbank.id, quantity: 1 },
    ],
  })

  const result = await placeOrder(
    { id: user.id, email: user.email, name: user.name },
    { address: ADDRESS, paymentMethod: 'CARD', deliveryMethod: 'COURIER' },
  )

  assert.ok('success' in result, 'zamówienie powinno się powieść')
  orderId = result.orderId

  const order = await db.order.findUniqueOrThrow({ where: { id: result.orderId } })
  assert.equal(order.subtotal, mouse.price + powerbank.price)
  assert.equal(order.deliveryCost, 0)
  assert.equal(order.total, order.subtotal)

  assert.equal(await db.cartItem.count({ where: { userId: user.id } }), 0)

  const emails = getEmailsTo(USER_EMAIL)
  assert.equal(emails.length, 1)
  assert.match(emails[0].html, /Gratis/)
})

test('checkout z pustym koszykiem zwraca błąd, nie tworzy zamówienia ani maila', async () => {
  const user = await db.user.findUniqueOrThrow({ where: { email: USER_EMAIL } })
  await db.cartItem.deleteMany({ where: { userId: user.id } })
  clearEmails()
  const ordersBefore = await db.order.count({ where: { userId: user.id } })
  const addressesBefore = await db.address.count({ where: { userId: user.id } })

  const result = await placeOrder(
    { id: user.id, email: user.email, name: user.name },
    { address: ADDRESS, paymentMethod: 'CARD', deliveryMethod: 'COURIER' },
  )

  assert.ok('error' in result, 'checkout powinien zwrócić błąd')
  assert.equal(result.error, 'Koszyk jest pusty.')
  assert.equal(await db.order.count({ where: { userId: user.id } }), ordersBefore)
  assert.equal(await db.address.count({ where: { userId: user.id } }), addressesBefore)
  assert.equal(await db.cartItem.count({ where: { userId: user.id } }), 0)
  assert.equal(getEmailsTo(USER_EMAIL).length, 0)
})

