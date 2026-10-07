# TDD TODO: limit ilości produktu w koszyku (frontend)

Źródła: [plan-limit-ilosci-w-koszyku.md](plan-limit-ilosci-w-koszyku.md), [kontrakt](contracts/limit-ilosci-w-koszyku.md).

## Cel
Kontrolki i komunikaty koszyka respektują limit `min(10, stan)`: gość ma limit 10 (stan nieznany), zalogowany ma limit z `product.stock`; stan 0 jest wyszarzony z komunikatem.

## Rodzaj
Zmiana zachowania (istniejący kod UI bez testów, więc pierwsze punkty działają też jako pinezki charakteryzujące).

## Definicja zielonego
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`

(`test:integration` pomijamy, bo nie dotykamy akcji serwerowych ani bazy.)

## Decyzje
- Gość: egzekwujemy tylko 10; stan sprawdza dopiero merge/checkout po stronie serwera (odpowiedź użytkownika, 2026-10-07).
- Reguła limitu to czysta logika w `hooks/cart-limit.ts` (zakres frontendu, bez współdzielenia z backendem).
- Frontend idzie na kontrakcie (szkic); braki backendu zapisujemy w "Oczekiwania wobec backendu" i zgłaszamy na końcu.
- Commit pytamy po każdym zielonym kroku.

## Poza zakresem
- Limit 5 różnych pozycji (BR-01), konto Premium.
- Migracja pozycji ponad limit, zmiany w `lib/`, `prisma/`, `app/api/`, `tests/integration/`.
- Wyszarzanie niedostępnego produktu na liście/karcie produktu.
- Zmiana przechowywania koszyka gościa.

## TODO (RED)
Kolejność = kolejność realizacji. Następny punkt oznacz `-> NEXT`.

- [x] 1. `getItemLimit(stock?)`: bez stanu zwraca 10, ze stanem `min(10, stan)`, stan 0 zwraca 0 | poziom: unit | pinezka dla dzisiejszego `min(10, stock)` w `AddToCartButton`
- [x] 2. `canIncrease(quantity, stock?)`: tak gdy `quantity < limit`; nie na limicie i ponad limitem | poziom: unit | dziś "+" zna tylko 10
- [x] 3. `canDecrease(quantity)`: tak gdy `quantity > 1`, także dla pozycji ponad limit | poziom: unit | pinezka dla dzisiejszego "−"
- [x] 4. `isUnavailable(stock?)`: `true` tylko dla stanu 0; brak stanu (gość) to `false` | poziom: unit
- [x] 5. `getLimitMessage(stock?)`: bez stanu "Maksymalnie 10 szt. tego produktu.", ze stanem "Maksymalnie 4 szt. tego produktu (dostępne: 4)." | poziom: unit | treść do zatwierdzenia przez Olę
- [x] 6. `checkGuestAdd(items, productId, qty)`: odrzuca gdy `existing + qty > 10`, zwraca komunikat; w limicie pozwala | poziom: unit | dziś store sumuje bez limitu
- [x] 7. `checkGuestUpdate(currentQty, newQty)`: odrzuca wzrost ponad 10; zmniejszenie dozwolone także z pozycji ponad limit | poziom: unit
- [ ] 8. `mapCartRow(row)`: przenosi `product.stock` do pozycji zalogowanego (`stock` opcjonalne w `CartLineItem`) -> NEXT | poziom: unit | wymaga `stock` w `/api/cart` (jest wg kontraktu)
- [ ] 9. `useCart.addItem` / `updateQty` gościa używają punktów 6-7 i ustawiają `error` | poziom: e2e (brak testów hooków w repo) | ryzyko: bez RTL sprawdzamy w E2E
- [ ] 10. `useCart.updateQty` zalogowanego pokazuje `{ error }` z serwera, a `/cart` go wyświetla | poziom: e2e | zależy od backendu
- [ ] 11. `CartItem`: "+" używa `canIncrease` z `stock`; pozycja ze stanem 0 wyszarzona, komunikat "Ten produkt nie jest dostępny", "+" zablokowany, "Usuń" działa | poziom: unit (helper stanu pozycji) + e2e | zależy od `stock` z backendu
- [ ] 12. Pozycja ponad limit w koszyku: "+" zablokowany, komunikat o limicie, "−" i "Usuń" działają | poziom: unit (helper) + e2e
- [ ] 13. Checkout: błąd z `placeOrder` (przycięcie, pusty koszyk) wyświetlany użytkownikowi | poziom: e2e | do sprawdzenia w kodzie strony checkout, zależy od backendu
- [ ] 14. E2E: gość dodaje 10 szt. i "+" jest zablokowany; kolejne dodanie z karty produktu pokazuje komunikat | poziom: e2e

## Rundy RGR
Powiązane punkty realizujemy razem w jednej rundzie (jeden RED z kilkoma testami, jeden GREEN, jeden commit). Punkty zależne od backendu lub E2E zostają osobno.

- Runda A: 1-4 (limit, `canIncrease`, `canDecrease`, `isUnavailable`) — zrobiona
- Runda B: 5-7 (komunikat, `checkGuestAdd`, `checkGuestUpdate`) — zrobiona
- Runda C: 8, 11, 12 (`mapCartRow`, helper stanu pozycji, `CartItem`) -> NEXT
- Runda D: 9, 10, 13 (podpięcie w `useCart`, błędy serwera, checkout)
- Runda E: 14 (E2E gościa)

## Pinezki (GREEN)
Zachowania przypięte testami. Nie zmieniać w REFACTOR.

- Limit `min(10, stan)`, bez stanu 10, stan 0 daje 0: `tests/unit/cart-limit.test.ts` (testy `getItemLimit`)
- "+" blokowany na limicie i powyżej, z uwzględnieniem stanu: `tests/unit/cart-limit.test.ts` (testy `canIncrease`)
- "−" blokowany tylko przy ilości 1, także dla pozycji ponad limit: `tests/unit/cart-limit.test.ts` (testy `canDecrease`)
- Niedostępny tylko przy stanie 0, brak stanu to nie niedostępność: `tests/unit/cart-limit.test.ts` (testy `isUnavailable`)
- Komunikat limitu bez stanu i ze stanem: `tests/unit/cart-limit.test.ts` (testy `getLimitMessage`)
- Dodanie gościa odrzucone przy `existing + qty > 10`, inne produkty nie wliczane: `tests/unit/cart-limit.test.ts` (testy `checkGuestAdd`)
- Zmiana ilości gościa: wzrost ponad 10 odrzucony, zmniejszenie zawsze dozwolone: `tests/unit/cart-limit.test.ts` (testy `checkGuestUpdate`)

## Oczekiwania wobec backendu
- `/api/cart` zwraca `product.stock` (kontrakt: już zwraca).
- `addToDbCart`, `updateDbCartQuantity` zwracają `{ error }` z komunikatem zawierającym limit i dostępną ilość.
- `mergeGuestCart` przycina do limitu; `placeOrder` usuwa pozycje ze stanem 0 i przycina ponad limit z błędem.

## Decyzje i sprzeczności
- 2026-10-07: TODO utworzone, tryb TDD wybrany przez użytkownika.
- 2026-10-07: odstępstwo od "jeden punkt naraz": powiązane punkty w rundach (patrz Rundy RGR), na prośbę użytkownika.
- 2026-10-07: komunikaty w `hooks/cart-messages.ts` (`CART_MESSAGES`); runda C dodaje tam `unavailable`. Komunikat BR-01 przeniesiony z `useCart` na prośbę użytkownika (poza pinezkami, bez zmiany treści).

## Postęp
- Runda A (pkt 1-4): RED / GREEN, commit: d14c05c
- Runda B (pkt 5-7): RED / GREEN, commit: caa90d8
- Refaktor po rundzie B (komunikaty do `CART_MESSAGES`): REFACTOR, commit: brak
