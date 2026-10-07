# Plan: limit ilości produktu w koszyku (backend)

Źródła: [plan analityka](plan-limit-ilosci-w-koszyku.md), [kontrakt](contracts/limit-ilosci-w-koszyku.md), [TODO frontendu](tdd-todo-limit-ilosci-w-koszyku-frontend.md) (sekcje Postęp i Oczekiwania wobec backendu).

## Rodzaj i cel
Zmiana funkcjonalności: reguła `min(10, stan)` egzekwowana na serwerze we wszystkich ścieżkach zapisu ilości koszyka zalogowanego (dodanie, zmiana, merge, checkout), z dowodami w testach omijających UI.

## Decyzje (zatwierdzone)
- Limit efektywny: `min(10, product.stock)`. Zmniejszanie i usuwanie zawsze dozwolone.
- `addToDbCart`: odrzuca całą operację, gdy `istniejąca + dodawana > limit`; koszyk bez zmian; `{ error }`.
- `updateDbCartQuantity`: odrzuca wzrost ponad limit; `qty <= 0` nadal usuwa; zmniejszenie z pozycji ponad limit dozwolone.
- `mergeGuestCart`: wynik `max(konto, gość)` przycięty do limitu, bez błędu. Pozycja produktu o stanie 0: zapisana bez przycinania do 0 (decyzja użytkownika; interpretacja w Ryzykach), checkout usuwa ją później.
- Ilość nieprawidłowa (niecałkowita, `NaN`): `{ error: 'Nieprawidłowa ilość.' }` w `addToDbCart` i `updateDbCartQuantity`. `addToDbCart` z `qty <= 0` to błąd. W merge pozycje z nieprawidłową ilością są pomijane.
- Treść komunikatu odrzucenia taka jak we frontendzie: „Maksymalnie {min(10, stan)} szt. tego produktu (dostępne: {stan}).” Przykład w kontrakcie do poprawy. Treść czeka na zatwierdzenie przez Olę.
- `placeOrder` w kolejności: (1) usuń pozycje ze stanem 0, (2) pusty koszyk to „Koszyk jest pusty.” bez zamówienia, (3) pozycje ponad `min(10, stan)` przycięte w bazie, błąd, brak zamówienia, (4) inaczej zamówienie jak dotąd. Błąd KOS-08 znika.
- Błędy koszyka bez `code` (frontend rozróżnia tytuł po obecności `code`).
- Pole `unavailableProducts` zostaje w typie `PlaceOrderResult` dla zgodności, nie jest wypełniane.
- Logika z tożsamością w `lib/cart.ts` (bez `'use server'`), akcje to cienkie opakowania.
- Duplikat reguły limitu z `hooks/cart-limit.ts` zostaje (decyzja użytkownika), opisany jako ryzyko.

## Zakres
- Backend: `lib/constants/cart.ts` (nowy), `lib/cart.ts` (nowy), `lib/actions/cart.ts`, `lib/orders.ts`.
- Baza danych: bez zmian schematu i seeda. Testy używają produktów z seeda o stanie 0 i 7/8.
- Usługi zewnętrzne: bez zmian (płatność i email jak dotąd, wywoływane dopiero po kroku 4 checkoutu).
- Frontend: poza zakresem (dostarczony). Zmiany kontraktu opisane w etapie 6.

## Etapy
1. **Czysta reguła limitu** — `lib/constants/cart.ts`: `MAX_ITEM_QUANTITY`, `getItemLimit(stock)`, `isValidQuantity`, `getLimitExceededMessage(stock)`, `getMergedQuantity(existing, incoming, stock)`, `classifyCheckoutItems(items)` (do usunięcia, do przycięcia). (*bez zależności*)
   - Weryfikacja: `npm run test:unit` → nowe testy `tests/unit/cart-rules.test.ts` przechodzą, reszta bez zmian.
2. **Refaktor: `lib/cart.ts`** — przeniesienie logiki `addToDbCart`, `updateDbCartQuantity`, `removeFromDbCart`, `mergeGuestCart` do funkcji przyjmujących `userId`; akcje wołają je z `getSessionUser()`. Zachowanie bez zmian. (*zależy od: 1 dla spójności modułów, nie blokuje*)
   - Weryfikacja: `npm run typecheck`, `npm run lint`, `npm run test:integration:direct` → bez zmian (istniejące testy zielone).
3. **Limit przy dodaniu i zmianie ilości** — `addToCart`, `updateCartQuantity` używają etapu 1, odrzucają przekroczenie i nieprawidłową ilość. (*zależy od: 1, 2*)
   - Weryfikacja: `npm run test:integration:direct` → nowe testy `tests/integration/cart-limit.test.ts` zielone.
4. **Limit w merge** — `mergeCart` przycina wynik i pomija nieprawidłowe pozycje. (*zależy od: 1, 2*)
   - Weryfikacja: jw., testy merge.
5. **Limit w checkoucie** — `placeOrder`: auto-usunięcie stanu 0, pusty koszyk, przycięcie z błędem bez zamówienia. (*zależy od: 1*)
   - Weryfikacja: `npm run test:integration:direct` → testy checkoutu limitu zielone, istniejące `checkout.test.ts` bez zmian.
6. **Dokumentacja i handoff** — kontrakt: status, przykład komunikatu, kolejność kroków; Postęp w tym planie; informacja dla frontendu. (*zależy od: 3-5*)
   - Weryfikacja: przegląd diffu dokumentacji.

Etapy 3, 4 i 5 mogą iść w dowolnej kolejności po 1 i 2. Proponowana kolejność: 1, 2, 3, 4, 5, 6.

## Plan testów
- **Unit** (`tests/unit/cart-rules.test.ts`): `getItemLimit` (stan 0, 7, 10, 25), `isValidQuantity` (całkowita dodatnia, 0, ujemna, ułamek, `NaN`), `getLimitExceededMessage`, `getMergedQuantity` (nowa, `max(konto, gość)`, ponad limit, stan 0), `classifyCheckoutItems` (stan 0, ponad limit, dokładnie na limicie, w limicie). Tu leżą wartości brzegowe.
- **Integracja** (`tests/integration/cart-limit.test.ts`, bezpośrednie wywołania `lib/cart.ts` i `placeOrder`, po jednym teście na regułę):
  - dodanie 11 szt. odrzucone, koszyk bez zmian,
  - kumulacja `istniejąca 9 + 2` odrzucona,
  - zmiana ilości ponad 10 odrzucona,
  - ponad stan (produkt o stanie 7) odrzucone z komunikatem zawierającym limit i stan,
  - zmniejszenie z pozycji ponad limit (wstawionej bezpośrednio do bazy) dozwolone, zwiększenie zablokowane,
  - nieprawidłowa ilość odrzucona,
  - merge przycina do limitu,
  - checkout: stan 0 usunięty i zamówienie z pozostałych pozycji, tylko stan 0 to błąd „Koszyk jest pusty.” bez zamówienia, ilość ponad limit to przycięcie, błąd, brak zamówienia, brak maila i niezmieniony `stock`.
  - Poziom integracji nie powtarza wartości brzegowych z unit.
- **E2E**: poza zakresem etapu backendowego (zgodnie z poleceniem użytkownika). Pozostaje punkt 14 w TODO frontendu.
- **Dane i sprzątanie:** produkty z seeda (stan 0 i 7), bez zmiany `stock`. Dedykowany użytkownik tworzony w `before` i usuwany w `after` (cart, zamówienia, adresy), żeby nie kolidować z `checkout.test.ts`, bo `node --test` uruchamia pliki równolegle na jednej bazie. Przed napisaniem cleanupu sprawdzę kaskady w `prisma/schema.prisma`. Przed edycją plików z `tests/integration` wczytam `.github/instructions/integration-tests.instructions.md`.

## Dokumentacja
- `docs/contracts/limit-ilosci-w-koszyku.md` — status, przykład komunikatu, potwierdzona kolejność kroków `placeOrder`, `unavailableProducts` nie jest wypełniane (etap 6).
- Ten plik — sekcja Postęp po każdym etapie.
- `docs/product-contract.md` — bez zmian (plan analityka tego nie przewiduje).

## Poza zakresem
- Frontend, E2E, `app/(shop)/`, `components/`, `hooks/`, `store/`.
- Limit 5 różnych pozycji (BR-01) i konto Premium.
- Migracja istniejących pozycji ponad limit.
- Informowanie klienta o pozycjach usuniętych w checkoucie.
- Zmniejszanie `stock` po zamówieniu (dziś go nie robi).
- Zmiana `package.json` i konfiguracji uruchamiania testów.

## Ryzyka i pytania otwarte
- Merge, stan 0: „zapisać bez zmian” rozumiem jako zapis pozycji z ilością z koszyka gościa, przyciętą tylko do globalnego 10 (limit 0 pominięty), bo checkout i tak usunie pozycję → do potwierdzenia przy zatwierdzaniu planu.
- Równoległe pliki testów na jednej bazie SQLite (możliwe `SQLITE_BUSY`) → dedykowany użytkownik i produkty z seeda bez modyfikacji; w razie problemów zgłoszę zmianę komendy (`--test-concurrency=1`).
- Dwa źródła limitu (`lib/constants/cart.ts` i `hooks/cart-limit.ts`) → ryzyko rozjazdu przy zmianie limitu; do usunięcia osobnym zgłoszeniem.
- `placeOrder` nie zmniejsza `stock`, więc limit liczony jest od stanu bez odliczeń → bez zmian (plan analityka, pytanie 5 do Oli).
- Treść komunikatów i priorytet/termin → do ustalenia z Olą.
- Gość: serwer nie widzi koszyka do merge → egzekwowanie po stronie klienta jest akceptowane (plan analityka, pytanie 1, do potwierdzenia przez Olę).

## Postęp (stan na 2026-10-07)

- [x] **1. Czysta reguła limitu** — `lib/constants/cart.ts`: `MAX_ITEM_QUANTITY`, `getItemLimit`, `isValidQuantity`, `INVALID_QUANTITY_MESSAGE`, `getLimitExceededMessage`, `getMergedQuantity`, `classifyCheckoutItems`. Testy `tests/unit/cart-rules.test.ts` (14). Commit `396c5ab` (WIP).
- [x] **2. Refaktor: `lib/cart.ts`** — `addToCart`, `removeFromCart`, `updateCartQuantity`, `mergeCart` (przyjmują `userId`, typ `CartResult`, stała `CART_LIMIT`); `lib/actions/cart.ts` to cienkie opakowania (sesja + `revalidatePath`). Zachowanie bez zmian. Commit `7009484` (WIP).
- [x] **3. Limit przy dodaniu i zmianie ilości** — `addToCart` (walidacja ilości, `istniejąca + dodawana > min(10, stan)` odrzucone), `updateCartQuantity` (wzrost ponad limit odrzucony, zmniejszenie zawsze dozwolone, `qty <= 0` usuwa, brak pozycji nadal `success`). Testy `tests/integration/cart-limit.test.ts` (10, dedykowany użytkownik `limit-test@shopeasy.pl`, produkty z seeda: powerbank stan 30, ekspres stan 7). Commit: wpiszę przy etapie 4.
- [ ] **4. Limit w merge** — nierozpoczęty.
- [ ] **5. Limit w checkoucie** — nierozpoczęty.
- [ ] **6. Dokumentacja i handoff** — nierozpoczęty.

**Weryfikacja:** etap 1: `npm run typecheck`, `npm run lint` bez błędów, `npm run test:unit` 73/73 (było 59). Etap 2: typecheck, lint, `test:unit` 73/73 i `test:integration:direct` 6/6 bez zmian. Etap 3: typecheck, lint, `test:unit` 73/73, `test:integration:direct` 16/16 (10 nowych). Nie uruchamiano: `test:integration` (przez `scripts/workshop.mjs`, poza zakresem).

**Tryb pracy:** użytkownik był niedostępny na bramkach, więc plan i testy z planu zostały przyjęte jako zatwierdzone, a etapy wykonuję kolejno z osobnym commitem WIP każdy.
