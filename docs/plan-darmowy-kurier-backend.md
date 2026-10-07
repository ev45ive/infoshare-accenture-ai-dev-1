# Plan: darmowy kurier DHL od 300 zł (backend, dokończenie)

Wejście: [docs/plan-darmowy-kurier.md](plan-darmowy-kurier.md) (kroki 1-2 backendu zrobione), [docs/plan-darmowy-kurier-frontend.md](plan-darmowy-kurier-frontend.md), kontrakt [docs/contracts/darmowy-kurier.md](contracts/darmowy-kurier.md), sekcja „Oczekiwania frontendu”.

## Rodzaj i cel
Zmiana funkcjonalności (kontrakt wyniku) — każdy wynik `createOrder`/`placeOrder` ma pole `success`, żeby `app/(shop)/checkout/payment/page.tsx` przechodziło `npm run typecheck` (błąd jest też na HEAD).

## Decyzje (zatwierdzone)
- To jedyna brakująca część backendu (potwierdzone przez użytkownika).
- Wariant A: `success: false` w każdej gałęzi błędu; dodatkowe pola zostają (`fieldErrors`, `unavailableProducts`, `code`).
- `createOrder` i istniejący test integracyjny przechodzą z `'success' in result` na `result.success`.
- Etapy 3-6 frontendu zostają u Frontend Developera (w tym `app/(shop)/checkout/payment/page.tsx`, niezacommitowany).

## Zakres
- Backend: `lib/orders.ts` (jawny typ wyniku `PlaceOrderResult`, `success: false` w gałęziach błędu), `lib/actions/checkout.ts` (`createOrder`: gałąź niezalogowanego, `revalidatePath` tylko przy `success`).
- Baza danych: nie.
- Usługi zewnętrzne: bez zmian (email, mock płatności).
- Frontend: poza zakresem; zmiana nie wymaga edycji `payment/page.tsx` (czyta `result.success`, `result.orderId`, `result.error`).

## Etapy
1. **Ujednolicony wynik zamówienia** — typ `PlaceOrderResult` w `lib/orders.ts` i użycie w `placeOrder`/`createOrder`; dostosowanie istniejących testów integracyjnych do nowego dyskryminatora; aktualizacja kontraktu (*zależy od: brak*).
   - Weryfikacja: `npm run typecheck` → 0 błędów (w tym `payment/page.tsx`); `npm run lint` → czysto; `npm run test:unit` → bez zmian; `npm run test:integration:direct` → wszystkie przechodzą.

## Postęp (stan na 2026-10-07)

- [x] **1. Ujednolicony wynik zamówienia** — `PlaceOrderResult` w `lib/orders.ts` (`success: true | false` w każdej gałęzi), `createOrder` z jawnym typem i `revalidatePath` tylko przy `success`; testy integracyjne: dwa istniejące przepisane na `result.success`, jeden nowy (błędny adres); kontrakt zaktualizowany. Commit WIP (hash w następnym etapie/Fazie C).
  - [x] Integracja: 6/6 w `npm run test:integration:direct` (w tym 1 nowy).

**Weryfikacja:** `typecheck` (0 błędów, w tym `payment/page.tsx` na working tree), `lint`, `test:unit` (26/26), `test:integration:direct` (6/6) przechodzą. Nie uruchamiano: `test:e2e`, `build`, weryfikacji ręcznej na działającej aplikacji.

**Uwaga:** `app/(shop)/checkout/payment/page.tsx` (etap 3 frontendu) jest nadal niezacommitowany i nie wchodzi do commitu tego etapu.

## Plan testów
- Unit: bez nowych (zmiana kształtu wyniku, brak logiki czystej).
- Integracja (`tests/integration/checkout.test.ts`):
  - istniejący test gratisu: `assert.ok('success' in result)` → `result.success === true`;
  - istniejący test pustego koszyka: `result.success === false` i `result.error`;
  - nowy: błędny adres zwraca `success: false` i `fieldErrors`, bez zamówienia i maila (dane nie są tworzone, więc bez cleanupu poza `clearEmails()`).
  - Dane z seeda i konta `test@shopeasy.pl`; sprzątanie jak w istniejącym pliku.
- E2E: poza zakresem (etap backendowy; scenariusz w planie frontendu, etap 6).
- Błędy płatności (`always_fail`/`always_timeout`): poza zakresem (wymagają `workshop:mode` wołającego `scripts/`).

## Dokumentacja
- `docs/contracts/darmowy-kurier.md` — sekcja „Oczekiwania frontendu” zamieniona na opis zrealizowanego kształtu wyniku (etap 1).
- `docs/product-contract.md` — bez zmian w tym planie (należy do etapu 5 frontendu).

## Poza zakresem
Schemat bazy, katalog, logowanie, mock płatności, `app/`, `components/`, `hooks/`, `store/`, `tests/e2e/`, `docs/product-contract.md`, migracja starych zamówień.

## Ryzyka i pytania otwarte
- `'success' in result` zmienia znaczenie po zmianie → zaktualizować test i `createOrder` w tym samym etapie (zaplanowane).
- `typecheck` zależy od niezacommitowanego `payment/page.tsx` frontendu → weryfikuję na working tree; commit etapu obejmuje tylko pliki backendu, testy, plan i kontrakt.
- Wcześniejsze przebiegi `typecheck` w etapach frontendu 1-2 przechodziły mimo błędu → przyczyny nie ustalono; po zmianie sprawdzę, czy `typecheck` jest wiarygodny (przebieg z czystym cache `tsc`, jeśli nadal się rozjeżdża).
