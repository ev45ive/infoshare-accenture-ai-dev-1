# Test Cases: Guest → Logged User Flow

**Aplikacja:** ShopEasy  
**Moduł:** Cart & Authentication  
**Data:** 2026-10-05  
**Status:** Ready for QA

---

## TC-01: Dodanie produktu jako gość i merge po zalogowaniu

**Cel:** Weryfikacja, czy koszyk gościa (localStorage) poprawnie merguje się do bazy danych po zalogowaniu.

**Preconditions:**
- Przeglądarki: Chrome, Firefox, Safari (latest)
- Strona dostępna: `http://127.0.0.1:3100/`
- Baza danych: fresh seed (npm run workshop:setup)
- Cookies: cleared (Ctrl+Shift+Delete)
- LocalStorage: cleared
- User testowy istnieje: `test@shopeasy.pl` / `Test1234!`

**Steps:**

| # | Akcja | Expected Result |
|---|-------|-----------------|
| 1 | Otwórz `/` bez sesji | Header: "Zaloguj się" \| "Zarejestruj się" |
| 2 | Scroll do produktów | Widoczne min. 8 produktów |
| 3 | Kliknij "Dodaj do koszyka" na Powerbank UltraCharge | Toast/feedback: "Dodano do koszyka" |
| 4 | Otwórz DevTools → Application → localStorage | `cart-store` zawiera: `productId: "powerbank-ultracharge-20000"`, `quantity: 1`, `price: 14999` |
| 5 | Naviguj: `/cart` | Heading: "Koszyk (1 szt.)" |
| 6 | | Widoczny produkt: "Powerbank UltraCharge" |
| 7 | | Cena: "149,99 zł" |
| 8 | | Podsumowanie: "Łącznie 149,99 zł" |
| 9 | Kliknij "Zaloguj się" | Redirect: `/login` |
| 10 | Wpisz: `test@shopeasy.pl` w pole email | Pole zawiera email bez walidacji bieżącej |
| 11 | Wpisz: `Test1234!` w pole hasło | Pole zawiera hasło (masked) |
| 12 | Kliknij "Zaloguj się" button | Heading znika, ładowanie... |
| 13 | Czekaj 1-2s na redirect | Redirect: `/` |
| 14 | Sprawdź header | "👤 Jan Testowy" + button "Wyloguj" (zmiana z "Zaloguj się") |
| 15 | Sprawdź cookies | Cookie `SESSION_COOKIE` present, HttpOnly flag ON |
| 16 | Otwórz DevTools → Network tab | Network czysty (cache disabled) |
| 17 | Naviguj: `/cart` | Network pokaże: `GET /api/auth/session` (status 200) |
| 18 | | Network pokaże: `GET /api/cart` (status 200) |
| 19 | Czekaj na render | Heading: "Koszyk (1 szt.)" |
| 20 | Sprawdź produkt | Powerbank UltraCharge widoczny |
| 21 | Sprawdź localStorage | `cart-store` jest pusty (cleared) **LUB** contains empty items array |
| 22 | Sprawdź response `/api/cart` | JSON zawiera: `[{ productId: "powerbank-...", product: { name, price, imageUrl }, quantity: 1 }]` |
| 23 | Kliknij "+1" (increase qty) | Quantity zmienia się na 2 |
| 24 | Sprawdź Network | `PATCH /api/cart` (lub POST) wysłana |
| 25 | Refresh `/cart` (F5) | Quantity nadal = 2 (data persisted w DB) |

**Expected Results:**
- ✅ Produkt dodany do localStorage (gość)
- ✅ Merge zadziałał (gość → DB)
- ✅ localStorage cleared po zalogowaniu
- ✅ Dalsza obsługa idzie z DB, nie localStorage
- ✅ Refresh nie resetuje ilości (persisted w DB)

**Post-Conditions:**
- Powerbank w koszyku zalogowanego użytkownika (1 szt. w DB)
- localStorage pusty
- Sesja aktywna (cookie)

---

## TC-02: Logowanie z błędnym hasłem

**Cel:** Weryfikacja obsługi błędnego hasła i blokady konta.

**Preconditions:**
- User: `test@shopeasy.pl` exists
- failedLoginAttempts: 0 (fresh state)
- Strona: `/login`

**Steps:**

| # | Akcja | Expected Result |
|---|-------|-----------------|
| 1 | Wpisz: `test@shopeasy.pl` | OK |
| 2 | Wpisz: `WrongPassword123` | OK |
| 3 | Kliknij "Zaloguj się" | Error message: "Nieprawidłowy e-mail lub hasło." |
| 4 | Network tab | Response status: **401** |
| 5 | Sprawdź DB: failedLoginAttempts | = 1 |
| 6 | Powtórz kroki 2-5 x 4 razy więcej | Po 5 próbach: failedLoginAttempts = 5 |
| 7 | 6. próba | Error: "Konto zablokowane na 15 minut z powodu zbyt wielu nieudanych prób logowania." |
| 8 | | Status: **423** (Locked) |
| 9 | Sprawdź DB: lockedUntil | > NOW() (zasetowany na ~15 min w przyszłość) |
| 10 | Czekaj 15s (symulacja) | Sprawdź DB: lockedUntil ainda > NOW() |
| 11 | (Po upływie 15 min w real scenario) | Wpisz poprawne hasło → logowanie powinno się powiednioć |

**Expected Results:**
- ✅ Licznik failedLoginAttempts increments
- ✅ Po 5 próbach: konto blokowane
- ✅ lockedUntil setowany na 15 minut
- ✅ Komunikat jasny dla user'a
- ✅ Status HTTP poprawny (401 → 423)

---

## TC-03: Checkout i zakonczenie zamówienia

**Cel:** Pełny flow od koszyka do potwierdzenia zamówienia.

**Preconditions:**
- User zalogowany: Jan Testowy
- Koszyk zawiera: Powerbank (1 szt.)
- URL: `/cart`

**Steps:**

| # | Akcja | Expected Result |
|---|-------|-----------------|
| 1 | Na stronie `/cart` | "Koszyk (1 szt.)" + Powerbank visible |
| 2 | Podsumowanie pokazuje: "Łącznie 149,99 zł" | OK |
| 3 | Kliknij "Przejdź do kasy" button | Redirect: `/checkout/delivery` |
| 4 | Czekaj na render | Heading: "Dostawa" lub "Adres dostawy" |
| 5 | Widoczne opcje dostawy | min. 2 opcje (standard, express) |
| 6 | Sprawdź Podsumowanie | Powerbank + cena nadal widoczne |
| 7 | Wybierz opcję dostawy | Radio button/toggle selected |
| 8 | Kliknij "Dalej" | POST `/checkout/delivery` sent |
| 9 | Czekaj na render | Redirect: `/checkout/payment` |
| 10 | Heading: "Płatność" | OK |
| 11 | Widoczne metody | CARD + BLIK |
| 12 | Zaznacz CARD | Selected |
| 13 | Wpisz dane karty: 4111111111111111 | OK |
| 14 | Wpisz CVC: 123 | OK |
| 15 | Wpisz expiry: 12/25 | OK |
| 16 | Kliknij "Zapłać" | POST `/checkout/payment` sent |
| 17 | Czekaj na processing | Loading state widoczny |
| 18 | Sprawdź Network | Response status: 200/201 |
| 19 | Czekaj na render | Redirect: `/checkout/success` |
| 20 | Heading: "Potwierdzenie zamówienia" | OK |
| 21 | Vidoczne szczegóły: | Order ID, customer, total |
| 22 | | Powerbank (1 szt.) |
| 23 | | Total: 149,99 zł |
| 24 | Sprawdź DB: orders table | Nowy order created |
| 25 | | userId = 'user-workshop' |
| 26 | | status = 'ACCEPTED' |
| 27 | | orderItems contains Powerbank |
| 28 | Kliknij na imię "Jan Testowy" | Redirect: `/account/profile` |
| 29 | Sprawdź header: "Moje konto · Jan Testowy" | OK |
| 30 | Kliknij "Historia zamówień" | Redirect: `/account/orders` |
| 31 | Widoczne zamówienie | Order ID, status, total |
| 32 | Kliknij na zamówienie | Szczegóły: Powerbank, data, cena |

**Expected Results:**
- ✅ Cały flow bez błędów
- ✅ Zamówienie zapisane w DB
- ✅ Order status: ACCEPTED
- ✅ Historia zamówień pokazuje nowy order
- ✅ Szczegóły się zgadzają

---

## TC-04: Wylogowanie i powrót gościa

**Cel:** Weryfikacja, że wylogowanie czyszcze sesję, ale gość może dodawać nowe produkty.

**Preconditions:**
- User zalogowany: Jan Testowy
- Na stronie: `/account/profile`

**Steps:**

| # | Akcja | Expected Result |
|---|-------|-----------------|
| 1 | Sprawdź header | "👤 Jan Testowy" + "Wyloguj" visible |
| 2 | Kliknij "Wyloguj" button | POST `/api/auth/logout` |
| 3 | Czekaj na redirect | Redirect: `/` |
| 4 | Sprawdź header | "Zaloguj się" \| "Zarejestruj się" (zmiana) |
| 5 | Sprawdź cookies | `SESSION_COOKIE` deleted lub expired |
| 6 | Sprawdź localStorage | Pusty (previous cart cleared) |
| 7 | Dodaj nowy produkt: Klawiatura | "Dodaj do koszyka" → success |
| 8 | Otwórz `/cart` | Heading: "Koszyk (1 szt.)" |
| 9 | | Widoczna Klawiatura (nowy koszyk gościa) |
| 10 | Sprawdź localStorage | `cart-store` zawiera Klawiaturę |
| 11 | Zaloguj się ponownie | test@shopeasy.pl / Test1234! |
| 12 | Otwórz `/cart` | Klawiatura zmergowana (wcześniej dodana) |
| 13 | | Powerbank z poprzedniego zamówienia: **NIE** widoczny (order completed) |

**Expected Results:**
- ✅ Sesja cleared
- ✅ Nowy gość może działać normalnie
- ✅ Merge zawsze zmerguje localStorage po zalogowaniu
- ✅ Wcześniejsze zamówienia nie wracają do koszyka

---

## TC-05: Limit produktów (BR-01) - Gość

**Cel:** Weryfikacja blokady limit 5 produktów dla gościa.

**Preconditions:**
- localStorage cleared
- Strona: `/`
- Fresh session (gość)

**Steps:**

| # | Akcja | Expected Result |
|---|-------|-----------------|
| 1 | Dodaj produkt #1 | OK |
| 2 | Dodaj produkt #2 | OK |
| 3 | Dodaj produkt #3 | OK |
| 4 | Dodaj produkt #4 | OK |
| 5 | Dodaj produkt #5 | OK |
| 6 | Otwórz `/cart` | "Koszyk (5 szt.)" |
| 7 | Próbuj dodać produkt #6 | Error: "Osiągnięto limit pozycji dla konta standardowego (5). Usuń produkt lub przejdź na konto Premium." |
| 8 | | Produkt #6 **nie** dodany |
| 9 | Sprawdź localStorage | Exactly 5 items |
| 10 | Usuń produkt #1 | OK |
| 11 | Otwórz `/cart` | "Koszyk (4 szt.)" |
| 12 | Spróbuj dodać produkt #6 | OK (limit przestał obowiązywać) |
| 13 | Otwórz `/cart` | "Koszyk (5 szt.)" + 4 z nich to nowe |

**Expected Results:**
- ✅ Limit 5 enforced na gościu
- ✅ Clear error message
- ✅ Po usunięciu — możliwość dodania nowego
- ✅ Refresh `/cart` pokazuje prawidłową ilość

---

## TC-06: Email verification (REG-03) - Nowy user

**Cel:** Weryfikacja blokady logowania dla niezweryfikowanego email.

**Preconditions:**
- Nowy user created: `newuser@test.pl`
- emailVerified = false
- email verification token wysłany

**Steps:**

| # | Akcja | Expected Result |
|---|-------|---|
| 1 | Otwórz `/login` | OK |
| 2 | Wpisz: `newuser@test.pl` / poprawne hasło | OK |
| 3 | Kliknij "Zaloguj się" | Error: "Konto nie zostało aktywowane. Sprawdź skrzynkę e-mail i kliknij link weryfikacyjny." |
| 4 | Response status | **403** (Forbidden) |
| 5 | Sprawdź e-mail inbox | Verification email present |
| 6 | Kliknij verification link | Redirect: `/auth/verify?token=...` |
| 7 | Czekaj na verification | Status: 200, message success |
| 8 | Sprawdź DB: emailVerified | = true |
| 9 | Otwórz `/login` | OK |
| 10 | Zaloguj się teraz | Powinna zadziałać (emailVerified = true) |

**Expected Results:**
- ✅ Logowanie blokowane bez veryfikacji
- ✅ Komunikat jasny
- ✅ E-mail verification działa
- ✅ Po weryfikacji — logowanie dostępne

---

## TC-07: Network Error Handling

**Cel:** Weryfikacja obsługi błędów sieci przy merge.

**Preconditions:**
- DevTools Network throttling: OFFLINE
- User: gość z produktem w localStorage
- Próba zalogowania

**Steps:**

| # | Akcja | Expected Result |
|---|-------|---|
| 1 | Wyłącz Internet (DevTools: Offline) | OK |
| 2 | Otwórz `/cart` (gość) | Koszyk widoczny (offline cache) |
| 3 | Włącz Internet | OK |
| 4 | Zaloguj się (`/login`) | POST `/api/auth/login` works (online now) |
| 5 | Otwórz `/cart` | fetch('/api/auth/session') - success |
| 6 | | mergeGuestCart() should succeed |
| 7 | Sprawdź localStorage | cleared |
| 8 | Sprawdź DB | Powerbank saved |

**Alternative - Merge fails:**

| # | Akcja | Expected Result |
|---|-------|---|
| 1 | Mock `/api/cart` error (500) | Network error |
| 2 | Otwórz `/cart` po zalogowaniu | Error message: "Nie udało się pobrać koszyka. Odśwież stronę." |
| 3 | Sprawdź localStorage | **NIE cleared** (rollback) |
| 4 | Refresh strony | Ponowna próba fetch |

**Expected Results:**
- ✅ Offline nie blokuje operacji zalogowania
- ✅ Merge obsługuje network errors gracefully
- ✅ Rollback: localStorage nie cleared jeśli merge failed
- ✅ Clear error message dla user'a

---

## TC-08: Account Security - Password Reset

**Cel:** Weryfikacja flow resetowania hasła.

**Preconditions:**
- User: `test@shopeasy.pl` exists
- Session cleared (zaloguj się i wyloguj)

**Steps:**

| # | Akcja | Expected Result |
|---|-------|---|
| 1 | Otwórz `/login` | OK |
| 2 | Kliknij "Zapomniałeś hasła?" | Redirect: `/reset-password` |
| 3 | Wpisz: `test@shopeasy.pl` | OK |
| 4 | Kliknij "Wyślij link resetowania" | POST `/api/auth/reset-password` |
| 5 | | Success message: "Link wysłany na e-mail" |
| 6 | Sprawdź e-mail | Reset link present |
| 7 | Kliknij reset link | Redirect: `/reset-password/confirm?token=...` |
| 8 | Wpisz nowe hasło: `NewPass123!` | OK |
| 9 | Kliknij "Zmień hasło" | POST token verification |
| 10 | Redirect: `/login` | OK |
| 11 | Zaloguj się: `test@shopeasy.pl` / `NewPass123!` | Success |
| 12 | Header: "👤 Jan Testowy" | Zalogowanie zadziałało |

**Expected Results:**
- ✅ Reset link wysłany
- ✅ Token verification działa
- ✅ Nowe hasło zaakceptowane
- ✅ Logowanie z nowym hasłem: success

---

## Regression Test Checklist

Po każdym deploy, sprawdzić:

- [ ] TC-01: Guest cart merge
- [ ] TC-02: Login with wrong password (5 attempts)
- [ ] TC-03: Full checkout flow
- [ ] TC-04: Logout & new guest flow
- [ ] TC-05: Limit 5 products enforced
- [ ] TC-06: Email verification blocking
- [ ] TC-07: Network error handling
- [ ] TC-08: Password reset flow
- [ ] Header zmienia się w zależności od sesji
- [ ] localStorage cleared po zalogowaniu
- [ ] Cookies: SESSION_COOKIE present & HttpOnly
- [ ] Network requests: no 4xx/5xx errors in happy path

---

## Known Issues / Bugs

*(wypełniać w trakcie testowania)*

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| BUG-001 | | | |

---

## Notes

- Wszystkie testy powinny być uruchamiane w **incognito/private mode** (czysta sesja)
- Database reset: `npm run workshop:setup`
- DevTools Network: disable cache dla dokładnego testu
- Przeglądarki do testowania: Chrome, Firefox, Safari
