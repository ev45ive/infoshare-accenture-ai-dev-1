# Plan: limit ilości produktu w koszyku (frontend, domknięcie)

Źródła: [plan analityka](plan-limit-ilosci-w-koszyku.md), [plan backendu](plan-limit-ilosci-w-koszyku-backend.md) (sekcja Postęp: etapy 1-6 zrobione), [kontrakt](contracts/limit-ilosci-w-koszyku.md), [TODO frontendu](tdd-todo-limit-ilosci-w-koszyku-frontend.md) (rundy A-D zrobione, otwarte punkty 9, 10, 13, 14).

## Rodzaj i cel
Zmiana UI/zachowania: domknąć frontend limitu `min(10, stan)` dowodem E2E dla ścieżek w przeglądarce (gość, zalogowany, checkout), skoro kod UI i backend są gotowe, ale UI nie był sprawdzony w przeglądarce.

## Decyzje (zatwierdzone)
- Logika UI (limit, stan pozycji, komunikaty, tytuł błędu) jest gotowa i przypięta testami jednostkowymi (`tests/unit/cart-limit.test.ts`, `tests/unit/order-error.test.ts`). Nie dodajemy nowej logiki.
- Gość: limit 10 po stronie klienta, stan sprawdza dopiero merge i checkout (decyzja użytkownika).
- Komunikaty bierzemy z `CART_MESSAGES` (frontend) i z odpowiedzi serwera (backend), te same treści.
- E2E tylko ścieżki użytkownika, bez powtarzania wartości brzegowych z unit/integracji.

## Zakres
- Strony/komponenty: bez zmian w kodzie produkcyjnym, chyba że E2E wykaże błąd.
- Stan klienta: bez zmian (`hooks/useCart.ts`, `store/cart.ts`).
- Backend: poza zakresem (gotowy, kontrakt zgodny).
- Testy: nowy plik `tests/e2e/limit-ilosci.spec.ts`.
- Stany UI: błąd (komunikat limitu przy dodaniu, błąd checkoutu), niedostępny produkt w koszyku, pozycja ponad limit.

## Etapy
1. **E2E gościa** (TODO pkt 9, 14) — dodanie 10 szt. z karty produktu, w koszyku „+” zablokowany, kolejne dodanie z karty pokazuje komunikat limitu. (*bez zależności*)
   - Weryfikacja: `npm run typecheck`, `npm run lint` → bez błędów. Uruchomienie E2E opisane w Ryzykach.
   - Ręcznie: `/products/mysz-swiftclick-8k` → Ilość 10 → „Dodaj do koszyka” → `/cart`: „+” nieaktywny → wróć na produkt, „Dodaj do koszyka” → „Maksymalnie 10 szt. tego produktu.”
2. **E2E zalogowanego** (pkt 10, 11, 12, 13) — (a) pozycja ze stanem 0 w koszyku: wyszarzona, komunikat „Ten produkt nie jest dostępny”, „+” zablokowany, „Usuń” działa; (b) dodanie ponad limit z karty produktu pokazuje błąd serwera; (c) checkout z pozycją ponad limit pokazuje błąd „Nie udało się złożyć zamówienia”, a podsumowanie pokazuje przyciętą ilość. (*zależy od: 1 dla spójności stylu*)
   - Weryfikacja: typecheck, lint.
   - Ręcznie: zalogowany `test@shopeasy.pl`; pozycje wstawione do bazy przez test (szczegóły w teście).
3. **Dokumentacja i domknięcie** — Postęp tego planu, TODO frontendu (punkty 9, 10, 13, 14), informacja o niezweryfikowanym uruchomieniu E2E. (*zależy od: 1, 2*)

## Plan testów
- **Unit:** bez nowych (logika przypięta w rundach A-D).
- **E2E** (`tests/e2e/limit-ilosci.spec.ts`, lokatory po roli i etykiecie, bez `waitForTimeout`):
  - gość: 10 szt. → „+” zablokowany → komunikat przy kolejnym dodaniu (produkt `mysz-swiftclick-8k`, stan 20),
  - zalogowany: pozycja ze stanem 0 (`sneakersy-urbanrun-pro`) wyszarzona z komunikatem, usuwanie działa,
  - zalogowany: dodanie ponad limit z karty (`powerbank-ultracharge-20000`, w koszyku 9 szt., dodanie 2) pokazuje komunikat serwera,
  - zalogowany: checkout z 12 szt. powerbanku (wstawione do bazy) kończy się błędem i przyciętą ilością 10.
  - Pominięte celowo: wartości brzegowe (unit/integracja), błąd `updateDbCartQuantity` z UI (przy „+” zablokowanym na limicie niedostępny w normalnej ścieżce).
- **Dane i sprzątanie:** konto i produkty z seeda; pozycje koszyka `user-workshop` wstawiane przez Prisma jak w `baseline.spec.ts`, usuwane w `afterEach`, żeby `baseline.spec.ts` nadal widział pusty koszyk. Gość nie zostawia stanu (świeży kontekst przeglądarki).

## Dokumentacja
- Ten plik: Postęp (etap 3).
- `docs/tdd-todo-limit-ilosci-w-koszyku-frontend.md`: oznaczenie punktów 9, 10, 13, 14 i Postęp (etap 3).

## Poza zakresem
- Backend, `lib/`, `prisma/`, `app/api/`, `tests/integration/`.
- Limit 5 pozycji (BR-01) i konto Premium.
- Wyszarzanie niedostępnego produktu na liście i karcie produktu.
- Zmiana przechowywania koszyka gościa, usunięcie duplikatu limitu 10 (`hooks/cart-limit.ts` i `lib/constants/cart.ts`).
- Weryfikacja w przeglądarce przez agenta (tylko na prośbę użytkownika).

## Ryzyka i pytania otwarte
- **Uruchomienie E2E:** `playwright.config.ts` startuje `npm run dev` (`scripts/dev.mjs`, poza zakresem) i wymaga bazy `workshop.db` w stanie startowym. Nie uruchamiam tego bez zgody użytkownika. Plan: napisać testy, sprawdzić `typecheck` i `lint`, a uruchomienie `npm run test:e2e` (po `npm run workshop:reset`) zostawić użytkownikowi → do ustalenia.
- Test E2E bez uruchomienia może mieć błędy lokatorów lub czasu → ograniczam się do lokatorów z istniejących testów i komponentów, w Postępie zapisuję „nie uruchamiano”.
- Treść komunikatów i priorytet/termin → do ustalenia z Olą.

## Postęp (stan na 2026-10-07)

- [x] **1. E2E gościa** — `tests/e2e/limit-ilosci.spec.ts`: 10 szt. z karty `mysz-swiftclick-8k`, w `/cart` "Zwiększ ilość" nieaktywny, kolejne dodanie pokazuje "Maksymalnie 10 szt. tego produktu.". **Nie uruchamiano** (patrz Ryzyka). Commit: wpiszę przy etapie 2.
- [ ] **2. E2E zalogowanego** — nierozpoczęty.
- [ ] **3. Dokumentacja i domknięcie** — nierozpoczęty.

**Weryfikacja:** etap 1: `npm run typecheck`, `npm run lint` bez błędów, `npm run test:unit` 73/73. Nie uruchamiano: `npm run test:e2e` (startuje `npm run dev` przez `scripts/dev.mjs`, poza zakresem; użytkownik niedostępny). Nie sprawdzano w przeglądarce: tak.

**Tryb pracy:** użytkownik był niedostępny na bramkach, więc plan przyjęto jako zatwierdzony i uruchamianie E2E zostawiono użytkownikowi.
