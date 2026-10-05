# Test Case: Guest → Add to Cart → Login (Happy Path)

**ID:** TC-HAPPY-001  
**Title:** Niezalogowany użytkownik dodaje produkt i się loguje  
**Autor:** QA Team  
**Data:** 2026-10-05  
**Priorytet:** Critical (P0)  
**Typ:** Functional / Integration

---

## Preconditions

- Aplikacja dostępna: `http://127.0.0.1:3100/`
- Baza danych: fresh seed (`npm run workshop:setup`)
- Browser cache: cleared
- LocalStorage: cleared
- Cookies: cleared (F12 → Application → Clear all)
- User testowy istnieje: 
  - Email: `test@shopeasy.pl`
  - Hasło: `Test1234!`
  - Status: emailVerified = true
- Device: Desktop (Chrome 120+, Firefox 121+, Safari 17+)
- Network: Online, bez throttlingu

---

## Scenariusz

**Opis:** Niezalogowany gość dodaje produkt do koszyka, następnie loguje się. Po zalogowaniu produkt z localStorage powinien być zmergowany do bazy danych.

---

## Test Steps

| # | Akcja | Expected Result |
|----|-------|-----------------|
| **1** | Otwórz stronę główną: `http://127.0.0.1:3100/` | ✅ Strona ładuje się |
| | | ✅ URL: `http://127.0.0.1:3100/` |
| | | ✅ Heading: "ShopEasy" visible |
| **2** | Sprawdź header (navbar) | ✅ Left side: "ShopEasy" logo (clickable) |
| | | ✅ Center: "Produkty" \| "🛒 Koszyk" (links) |
| | | ✅ Right side: "Zaloguj się" \| "Zarejestruj" (buttons/links) |
| **3** | Sprawdź main section (hero) | ✅ Heading 1: "ShopEasy" |
| | | ✅ Subheading: "Twój ulubiony sklep internetowy" |
| | | ✅ Buttons: "Przeglądaj produkty" \| "Zarejestruj się" |
| **4** | Scroll down do sekcji produktów | ✅ "Polecane produkty" heading visible |
| | | ✅ Min. 8 produktów w grid layout |
| **5** | Lokalizuj produkt: "Powerbank UltraCharge 20000" | ✅ Produkt znaleziony |
| | | ✅ Obrazek widoczny |
| | | ✅ Nazwa: "Powerbank UltraCharge 20000" |
| | | ✅ Kategoria: "Elektronika" (badge) |
| | | ✅ Cena: "149,99 zł" |
| | | ✅ Button: "Dodaj do koszyka" |
| **6** | Kliknij "Dodaj do koszyka" na Powerbanku | ✅ Button się dezaktywuje na krótko (disabled state) |
| | | ✅ Toast/notification: Brak vidocznego (lub "Dodano do koszyka" jeśli implementowany) |
| **7** | Otwórz DevTools (F12) → Application tab | ✅ DevTools otwarte |
| **8** | W DevTools, otwórz Storage → LocalStorage | ✅ Domain: `127.0.0.1:3100` selected |
| **9** | Sprawdź localStorage key: `cart-store` | ✅ Key istnieje: `cart-store` |
| | | ✅ Value zawiera JSON z array `items` |
| **10** | Sprawdź struktura localStorage | ✅ JSON parseable: `{ items: [...], ... }` |
| | | ✅ items[0] zawiera: |
| | | - `productId`: wartość string (np. "powerbank-ultracharge-20000") |
| | | - `name`: "Powerbank UltraCharge 20000" |
| | | - `price`: 14999 (liczba w groszach) |
| | | - `quantity`: 1 |
| | | - `imageUrl`: string URL |
| **11** | Zamknij DevTools (F12) | ✅ DevTools zamknięte |
| **12** | Kliknij link "🛒 Koszyk" w header | ✅ Navigation bez opóźnień |
| | | ✅ URL zmienia się na: `http://127.0.0.1:3100/cart` |
| **13** | Czekaj na render `/cart` | ✅ Strona załadowana (< 2s) |
| **14** | Sprawdź main heading | ✅ Heading: "Koszyk (1 szt.)" |
| **15** | Sprawdź produkt w koszyku | ✅ Widoczny: Powerbank UltraCharge... |
| | | ✅ Cena: "149,99 zł / szt." |
| | | ✅ Quantity controls: "-" (disabled) \| "1" \| "+" (enabled) |
| | | ✅ Total cena: "149,99 zł" |
| | | ✅ Button: "Usuń" |
| **16** | Sprawdź sekcję "Podsumowanie" | ✅ Heading: "Podsumowanie" |
| | | ✅ Linia 1: "Produkty (1 szt.)" = "149,99 zł" |
| | | ✅ Linia 2: "Dostawa" = "obliczana przy kasie" |
| | | ✅ Separator/linia |
| | | ✅ Linia 3: "Łącznie" = "149,99 zł" (bold/emphasized) |
| | | ✅ Button: "Przejdź do kasy" (CTA, prominent) |
| **17** | W header, kliknij "Zaloguj się" | ✅ Navigation bez opóźnień |
| | | ✅ URL zmienia się na: `http://127.0.0.1:3100/login` |
| **18** | Czekaj na render `/login` | ✅ Strona załadowana |
| **19** | Sprawdź formularz | ✅ Heading: "Zaloguj się" |
| | | ✅ Label: "E-mail" |
| | | ✅ Input field: type="email" placeholder lub label |
| | | ✅ Label: "Hasło" |
| | | ✅ Input field: type="password" masked |
| | | ✅ Button: "Zaloguj się" (prominent CTA) |
| | | ✅ Links: "Zapomniałeś hasła?" \| "Zarejestruj się" |
| **20** | Kliknij na input "E-mail" | ✅ Focus state widoczny (border color zmienia się) |
| **21** | Wpisz e-mail: `test@shopeasy.pl` | ✅ Tekst pojawia się w polu |
| | | ✅ Żadne validation errory (pole puste do tej pory ok) |
| **22** | Kliknij na input "Hasło" | ✅ Focus state widoczny |
| **23** | Wpisz hasło: `Test1234!` | ✅ Tekst maskowany (●●●●●●●●) |
| | | ✅ Żadne validation errory |
| **24** | Kliknij button "Zaloguj się" | ✅ Button zmienia się na disabled state |
| | | ✅ Loading indicator (spinner/text) pojawia się |
| **25** | Otwórz DevTools → Network tab | ✅ Network tab otwarte |
| | | ✅ Request visible: `POST /api/auth/login` |
| | | ✅ Status: **200** (success) |
| | | ✅ Response body zawiera: `{ success: true }` LUB `{ user: {...} }` |
| **26** | Czekaj na redirect | ✅ URL zmienia się na: `http://127.0.0.1:3100/` |
| | | ✅ Redirect automatyczny (< 1s) |
| **27** | Sprawdź header (navbar) po zalogowaniu | ✅ **ZMIANA**: "Zaloguj się" \| "Zarejestruj" |
| | | ✅ **ZMIENIŁ SIĘ NA**: "👤 Jan Testowy" + button "Wyloguj" |
| **28** | Otwórz DevTools → Application → Cookies | ✅ Cookie istnieje: `SESSION_COOKIE` LUB `session` |
| | | ✅ Flag `HttpOnly`: **ON** (brak dostępu z JS) |
| | | ✅ Flag `Secure`: ON (jeśli HTTPS) |
| | | ✅ SameSite: "Lax" LUB "Strict" |
| **29** | Zamknij DevTools | ✅ DevTools zamknięte |
| **30** | Kliknij na "🛒 Koszyk" w header | ✅ Navigation |
| | | ✅ URL: `http://127.0.0.1:3100/cart` |
| **31** | Czekaj na render `/cart` | ✅ Strona załadowana |
| **32** | Otwórz DevTools → Network tab | ✅ Network tab otwarte |
| | | ✅ Request 1: `GET /api/auth/session` (status 200) |
| | | ✅ Request 2: `GET /api/cart` (status 200) |
| **33** | Sprawdź response `/api/cart` | ✅ Response: JSON array |
| | | ✅ Array zawiera min. 1 object |
| | | ✅ Object zawiera: |
| | | - `productId`: "powerbank-ultracharge-20000" |
| | | - `product.name`: "Powerbank UltraCharge 20000" |
| | | - `product.price`: 14999 |
| | | - `product.imageUrl`: string URL |
| | | - `quantity`: 1 |
| **34** | Zamknij DevTools | ✅ DevTools zamknięte |
| **35** | Sprawdź heading `/cart` | ✅ Heading: "Koszyk (1 szt.)" |
| **36** | Sprawdź produkt | ✅ Powerbank UltraCharge widoczny |
| | | ✅ Cena: "149,99 zł / szt." |
| | | ✅ Quantity: 1 |
| | | ✅ Total: "149,99 zł" |
| **37** | Otwórz DevTools → Application → LocalStorage | ✅ Key: `cart-store` |
| | | ✅ Value: PUSTY LUB `{ items: [] }` |
| | | ✅ localStorage **został wyczyszczony po merge** ✅ |
| **38** | Zamknij DevTools | ✅ DevTools zamknięte |
| **39** | Kliknij "+" (increase quantity) | ✅ Quantity zmienia się: 1 → 2 |
| | | ✅ Total zmienia się: 149,99 → 299,98 zł |
| **40** | Otwórz DevTools → Network | ✅ Request wysłany (POST/PATCH `/api/cart`) |
| **41** | Refresh strony (F5) | ✅ Strona załadowana ponownie |
| **42** | Czekaj na render | ✅ Quantity nadal = 2 |
| | | ✅ Total nadal = 299,98 zł |
| | | ✅ Dane **persisted w DB**, nie z localStorage |
| **43** | Sprawdź sesję (header) | ✅ Nadal zalogowany: "👤 Jan Testowy" |

---

## Expected Results Summary

### 🟢 Happy Path - Wszystko działa:

✅ **Faza 1: Gość dodaje produkt**
- Produkt dodany do localStorage
- localStorage ma strukturę: `{ items: [{ productId, name, price, quantity, imageUrl }] }`
- Koszyk gościa pokazuje: "Koszyk (1 szt.)" + Powerbank 149,99 zł

✅ **Faza 2: Logowanie**
- POST `/api/auth/login` → status 200
- Cookie `SESSION_COOKIE` ustawiony (HttpOnly)
- Redirect na `/` automatyczny
- Header zmienił się: "👤 Jan Testowy" + "Wyloguj"

✅ **Faza 3: Merge & Fetch**
- GET `/api/auth/session` → status 200, user data zwrócony
- GET `/api/cart` → status 200, Powerbank zwrócony z DB
- localStorage wyczyszczony
- Koszyk pokazuje: "Koszyk (1 szt.)" + Powerbank z DB (nie localStorage)

✅ **Faza 4: Persistance**
- Zmiana quantity (1 → 2) → POST/PATCH wysłany
- Refresh strony → quantity = 2 (persisted w DB)
- Nadal zalogowany

---

## Assertions (do automatyzacji)

```javascript
// Po kroku 10 - localStorage
assert(localStorage.getItem('cart-store') !== null, 'cart-store exists')
const cart = JSON.parse(localStorage.getItem('cart-store'))
assert(cart.items.length === 1, 'items array has 1 item')
assert(cart.items[0].productId.includes('powerbank'), 'productId correct')
assert(cart.items[0].price === 14999, 'price in grosze')
assert(cart.items[0].quantity === 1, 'quantity = 1')

// Po kroku 14 - /cart gościa
assert(page.locator('h1').contains('Koszyk (1 szt.)'), 'heading correct')
assert(page.locator('text=Powerbank').isVisible(), 'product visible')
assert(page.locator('text=149,99').isVisible(), 'price visible')

// Po kroku 25 - login response
assert(response.status === 200, 'login status 200')
assert(response.json().success === true, 'success flag')

// Po kroku 27 - header zmienił się
assert(page.locator('text=Jan Testowy').isVisible(), 'user name visible')
assert(page.locator('button:has-text("Wyloguj")').isVisible(), 'logout button visible')

// Po kroku 32 - network requests
assert(requests.find(r => r.method === 'GET' && r.url.includes('/api/auth/session')), 'session request made')
assert(requests.find(r => r.method === 'GET' && r.url.includes('/api/cart')), 'cart request made')

// Po kroku 37 - localStorage cleared
const cartAfterLogin = JSON.parse(localStorage.getItem('cart-store') || '{}')
assert(cartAfterLogin.items?.length === 0 || !localStorage.getItem('cart-store'), 'localStorage cleared')

// Po kroku 42 - persistence
const itemsAfterRefresh = page.locator('[data-quantity]')
assert(itemsAfterRefresh.count() === 1, '1 item in cart')
assert(page.locator('text=299,98').isVisible(), 'total updated to 299,98')
assert(!localStorage.getItem('cart-store') || JSON.parse(localStorage.getItem('cart-store')).items.length === 0, 'still cleared')
```

---

## Success Criteria

✅ Test PASSED jeśli wszystkie kroki zadziałały bez błędów i:
1. Produkt został dodany do localStorage (gość)
2. localStorage wyczyszczony po zalogowaniu
3. Produkt pojawił się w DB (`GET /api/cart`)
4. Quantity zmieniona i persisted (refresh pokazuje zmianę)
5. Sesja aktywna (header pokazuje user)
6. Żadne network errory (status 4xx, 5xx)

---

## Failure Criteria

❌ Test FAILED jeśli:
- localStorage nie zawiera produktu po dodaniu
- login zwrócił status != 200
- Header nie zmienił się po logowaniu
- `/api/cart` zwrócił pusty array zamiast produktu
- localStorage **nie został** wyczyszczony
- Quantity po refresh wrócił do 1 (dane z localStorage, nie DB)
- Cookie SESSION_COOKIE brak lub HttpOnly = false

---

## Test Automation (Playwright Example)

```typescript
import { test, expect } from '@playwright/test'

test('TC-HAPPY-001: Guest → Add to Cart → Login', async ({ page }) => {
  // 1. Open homepage
  await page.goto('http://127.0.0.1:3100/')
  await expect(page).toHaveTitle(/ShopEasy/)

  // 2. Find and add Powerbank to cart
  await page.click('button:has-text("Dodaj do koszyka"):nth-child(5)') // Powerbank is ~5th
  
  // 3. Verify localStorage
  const cartStore = await page.evaluate(() => localStorage.getItem('cart-store'))
  expect(cartStore).toBeTruthy()
  const cart = JSON.parse(cartStore!)
  expect(cart.items).toHaveLength(1)
  expect(cart.items[0].price).toBe(14999)

  // 4. Navigate to /cart
  await page.click('a:has-text("Koszyk")')
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.locator('h1')).toContainText('Koszyk (1 szt.)')

  // 5. Navigate to /login
  await page.click('a:has-text("Zaloguj się")')
  await expect(page).toHaveURL(/\/login/)

  // 6. Login
  await page.fill('input[type="email"]', 'test@shopeasy.pl')
  await page.fill('input[type="password"]', 'Test1234!')
  await page.click('button:has-text("Zaloguj się")')
  
  // Wait for redirect & verify user logged in
  await page.waitForURL('http://127.0.0.1:3100/')
  await expect(page.locator('text=Jan Testowy')).toBeVisible()

  // 7. Go to /cart
  await page.click('a:has-text("Koszyk")')
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.locator('h1')).toContainText('Koszyk (1 szt.)')
  
  // 8. Verify product is from DB (not localStorage)
  const response = await page.waitForResponse(r => r.url().includes('/api/cart'))
  const data = await response.json()
  expect(data).toHaveLength(1)
  expect(data[0].productId).toContain('powerbank')
  
  // 9. Verify localStorage cleared
  const cartAfterLogin = await page.evaluate(() => localStorage.getItem('cart-store'))
  const parsedCart = JSON.parse(cartAfterLogin || '{}')
  expect(parsedCart.items?.length || 0).toBe(0)
  
  // 10. Change quantity & refresh
  await page.click('button:has-text("+")')
  await page.waitForResponse(r => r.url().includes('/api/cart'))
  await page.reload()
  
  // 11. Verify quantity persisted (from DB)
  await expect(page.locator('text=299,98')).toBeVisible()
})
```

---

## Notes

- Test może trwać: **2-3 minuty** (manualnie)
- Automation: **< 30 sekund** (z Playwright)
- Wszystkie asercje powinny być explicitne (nie domniemane)
- W przypadku błędu, screenshot + DevTools logs (Network, Console)
- Test powinien być niezależny (Fresh DB state przed testem)
