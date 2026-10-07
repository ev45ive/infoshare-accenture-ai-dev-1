import { test, expect, type Page } from 'playwright/test'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { resolve } from 'node:path'

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${resolve('workshop.db').replaceAll('\\', '/')}` }) })
const USER_ID = 'user-workshop'

test.beforeEach(async () => { await db.cartItem.deleteMany({ where: { userId: USER_ID } }) })
test.afterEach(async () => { await db.cartItem.deleteMany({ where: { userId: USER_ID } }) })
test.afterAll(async () => { await db.$disconnect() })

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('test@shopeasy.pl')
  await page.getByLabel('Hasło', { exact: true }).fill('Test1234!')
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Wyloguj' })).toBeVisible()
}

async function gotoAfterSession(page: Page, url: string) {
  const session = page.waitForResponse('**/api/auth/session')
  await page.goto(url)
  await session
}

test('gość: limit 10 szt. blokuje "+" w koszyku i kolejne dodanie z karty produktu', async ({ page }) => {
  await page.goto('/products/mysz-swiftclick-8k')
  await page.getByLabel('Ilość:').selectOption('10')
  await page.getByRole('button', { name: /Dodaj do koszyka/ }).click()

  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: /Koszyk \(10 szt\.\)/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Zwiększ ilość' })).toBeDisabled()

  await page.goto('/products/mysz-swiftclick-8k')
  await page.getByRole('button', { name: /Dodaj do koszyka/ }).click()
  await expect(page.getByText('Maksymalnie 10 szt. tego produktu.')).toBeVisible()
})

test('zalogowany: pozycja ze stanem 0 jest wyszarzona z komunikatem, bez "+", a usuwanie działa', async ({ page }) => {
  const sneakers = await db.product.findUniqueOrThrow({ where: { slug: 'sneakersy-urbanrun-pro' } })
  expect(sneakers.stock).toBe(0)
  await db.cartItem.create({ data: { userId: USER_ID, productId: sneakers.id, quantity: 1 } })
  await login(page)

  await gotoAfterSession(page, '/cart')
  await expect(page.getByText('Ten produkt nie jest dostępny')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Zwiększ ilość' })).toBeDisabled()

  await page.getByRole('button', { name: 'Usuń produkt' }).click()
  await expect(page.getByRole('heading', { name: 'Twój koszyk jest pusty' })).toBeVisible()
  await expect.poll(() => db.cartItem.count({ where: { userId: USER_ID } })).toBe(0)
})

test('zalogowany: dodanie ponad limit z karty produktu pokazuje komunikat serwera', async ({ page }) => {
  const powerbank = await db.product.findUniqueOrThrow({ where: { slug: 'powerbank-ultracharge-20000' } })
  await db.cartItem.create({ data: { userId: USER_ID, productId: powerbank.id, quantity: 9 } })
  await login(page)

  await gotoAfterSession(page, '/products/powerbank-ultracharge-20000')
  await page.getByLabel('Ilość:').selectOption('2')
  await page.getByRole('button', { name: /Dodaj do koszyka/ }).click()

  await expect(page.getByText(`Maksymalnie 10 szt. tego produktu (dostępne: ${powerbank.stock}).`)).toBeVisible()
  expect((await db.cartItem.findFirstOrThrow({ where: { userId: USER_ID } })).quantity).toBe(9)
})

test('zalogowany: checkout z ilością ponad limit pokazuje błąd i przyciętą ilość, bez zamówienia', async ({ page }) => {
  const powerbank = await db.product.findUniqueOrThrow({ where: { slug: 'powerbank-ultracharge-20000' } })
  await db.cartItem.create({ data: { userId: USER_ID, productId: powerbank.id, quantity: 12 } })
  const ordersBefore = await db.order.count({ where: { userId: USER_ID } })
  await login(page)

  await page.goto('/checkout/delivery')
  await page.getByLabel('Imię', { exact: true }).fill('Jan')
  await page.getByLabel('Nazwisko', { exact: true }).fill('Testowy')
  await page.getByLabel('Ulica i numer').fill('Testowa 12')
  await page.getByLabel('Kod pocztowy').fill('00-001')
  await page.getByLabel('Miasto').fill('Warszawa')
  await page.getByLabel('Telefon').fill('600000000')
  await page.getByRole('button', { name: 'Przejdź do płatności' }).click()
  await expect(page).toHaveURL(/\/checkout\/payment/)
  await page.getByRole('button', { name: 'BLIK', exact: true }).click()
  await page.getByLabel('Kod BLIK').fill('123456')
  await page.getByRole('button', { name: 'Zapłać', exact: true }).click()

  await expect(page.getByText('Nie udało się złożyć zamówienia')).toBeVisible()
  await expect(page.getByText(/Maksymalna ilość jednego produktu to 10 szt\./)).toBeVisible()
  await expect(page.getByText(`${powerbank.name} × 10`)).toBeVisible()
  expect((await db.cartItem.findFirstOrThrow({ where: { userId: USER_ID } })).quantity).toBe(10)
  expect(await db.order.count({ where: { userId: USER_ID } })).toBe(ordersBefore)
})
