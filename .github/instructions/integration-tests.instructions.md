---
description: "Use when writing, editing or reviewing integration tests in tests/integration: checkout, katalog, zamówienia, cleanup bazy, asercje, przypadki brzegowe. Zastosuj jeśli recenzujesz, zmieniasz lub dodajesz testy integracyjne w tests/integration"
applyTo: "tests/integration/*.test.ts"
---

# Zasady testów integracyjnych

## Izolacja
- Używaj wyłącznie bazy `.workshop/integration.db`; nigdy `workshop.db`.
- `DATABASE_URL` ustawia `tests/integration/setup.ts` ładowany przez `--import` (`npm run test:integration:direct`); nie importuj `lib/db` w `setup.ts`.
- Nie zależ od stanu zostawionego przez inne testy ani poprzednie uruchomienia.
- Testy używające konta `test@shopeasy.pl` nie mogą działać równolegle.

## Struktura
- Arrange / Act / Assert, oddzielone pustą linią.
- Jeden test = jedna reguła biznesowa; nazwa opisuje zachowanie (np. „zamówienie kurierem >= 300 zł zapisuje deliveryCost 0").
- Używaj `node:test` i `node:assert/strict`; bez dodatkowych frameworków.

## Dane
- Dane referencyjne pobieraj z bazy (`findUniqueOrThrow`), nie hardkoduj cen ani ID.
- Przed asercją zweryfikuj założenie wejściowe (np. suma koszyka przekracza próg darmowej dostawy).
- Powtarzalny arrange wynoś do helperów/fabryk.
- Używaj wyłącznie danych fikcyjnych.
- Oczekiwane wartości wyprowadzaj z `docs/product-contract.md`; nie testuj reguł spoza kontraktu.

## Sprzątanie
- Usuń wszystko, co test utworzył: zamówienie, pozycje zamówienia, adres, pozycje koszyka.
- Przed napisaniem cleanupu sprawdź kaskady w `prisma/schema.prisma`; nie zakładaj, że `deleteMany` usuwa powiązane rekordy.
- Przywróć zmodyfikowany stan (np. `stock`), jeśli `placeOrder` go zmienia.
- Cleanup w `after`/`finally`, aby działał także po nieudanym teście; zawsze `db.$disconnect()`.
- Stan w pamięci (`clearEmails()`) czyść w `before` i `after`.

## Asercje
- Sprawdzaj wynik funkcji, stan bazy i efekty uboczne (e-mail, koszyk), nie tylko jedno z nich.
- Mail: asercja na odbiorcy, temacie i linii z kwotą dostawy, nie samo wystąpienie słowa w treści.
- Kwoty porównuj z wartościami wyliczonymi z danych wejściowych, nie z magicznymi liczbami.
- Listy: sprawdzaj `total`, liczbę elementów i właściwości każdego elementu (`every`).

## Pokrycie
- Progi testuj na granicy: tuż poniżej, równo na progu, tuż powyżej.
- Dodawaj przypadki negatywne: pusty koszyk, brak stanu magazynowego, nieistniejący produkt, błędny adres.
- Każdą metodę dostawy i płatności testuj osobno.
- Błędy płatności (`always_fail`, `always_timeout`): potwierdź brak zamówienia oraz niezmieniony koszyk i `stock`.

## Utrzymanie
- Asercje zależne od liczności seeda (np. 12 produktów) aktualizuj razem z `prisma/seed.ts`.
- Po zmianach uruchom `npm run test:integration:direct`, `npm run typecheck`, `npm run lint`.
- Nie osłabiaj ani nie usuwaj asercji, żeby test przeszedł; zgłoś rozbieżność z kontraktem.
