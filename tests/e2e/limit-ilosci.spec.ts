import { test, expect } from 'playwright/test'

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
