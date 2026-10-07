# Plan: darmowy kurier DHL od 300 zł (frontend)

Wejście: analiza Analityka (wcześniejsza treść tego pliku), [docs/plan-darmowy-kurier.md](plan-darmowy-kurier.md), kontrakt [docs/contracts/darmowy-kurier.md](contracts/darmowy-kurier.md).

## Rodzaj i cel
Zmiana UI/zachowania — klient widzi tę samą kwotę dostawy, którą zapisuje zamówienie (backend już liczy gratis od 300 zł).

## Decyzje (zatwierdzone)
- Próg: suma produktów >= 30000 gr, tylko kurier DHL; paczkomat 9,99 zł bez zmian.
- Koszyk, wiersz „Dostawa”: „Od 9,99 zł; gratis kurierem od 300 zł”.
- Koszyk poniżej progu: pasek + „Brakuje X zł do darmowej dostawy”; po progu: „Masz darmową dostawę kurierem DHL”.
- Koszt liczony na nowo z aktualnego koszyka na każdym kroku; w `sessionStorage` tylko id metody.
- 0 zł w zamówieniu = „Gratis”; stare zamówienia bez zmian (przed zmianą dostawa nigdy nie wynosiła 0).
- Brakująca kwota: inline w `CartSummary` (`Math.max(0, FREE_DELIVERY_THRESHOLD - total)`), bez zmian w `lib/`.
- Strona dostawy: lokalna mapa samych etykiet i podtytułów po id (bez cen); ceny z `DELIVERY_OPTIONS` i `calculateDeliveryCost`.
- Brzmienie komunikatów wymaga potwierdzenia PO (ustalone w analizie, nie ze zgłoszenia).

## Zakres
- Strony/komponenty: `components/cart/CartSummary.tsx`, `app/(shop)/checkout/delivery/page.tsx`, `app/(shop)/checkout/payment/page.tsx`, `app/(shop)/checkout/success/page.tsx`, `app/(shop)/account/orders/[id]/page.tsx`
- Stan klienta: bez zmian (`store/`, `hooks/` nietknięte).
- Backend: poza zakresem (gotowy: `calculateDeliveryCost`, `calculateOrderTotals`, `formatDeliveryCost`, `placeOrder`). Poprawki tylko po zgłoszeniu i zgodzie.
- Stany UI: koszyk pusty/loading/error bez zmian (obsługuje `cart/page.tsx`); delivery: pusty koszyk → suma 0, dostawa wg metody; sukces/historia: „Gratis” dla 0.
- Gość i zalogowany: koszyk działa dla obu; checkout tylko zalogowany (proxy).

## Etapy
1. **Koszyk** — `CartSummary`: wiersz „Dostawa”, pasek postępu (`role="progressbar"`), komunikat po progu. „Łącznie” nadal = suma produktów.
   - Weryfikacja: `npm run typecheck` i `npm run lint` → bez błędów.
   - Ręcznie: `/cart` — słuchawki ×1 (299,99 zł): „Brakuje 0,01 zł…”; dodaj świecę (339,98 zł): „Masz darmową dostawę kurierem DHL”.
2. **Strona dostawy** (*zależy od: 1 tylko wizualnie*) — usunięcie lokalnych `DELIVERY_OPTIONS` i `formatPrice`; `calculateOrderTotals` dla sumy i kosztu; kurier „Gratis” + przekreślone 14,99 zł; paczkomat zawsze 9,99 zł.
   - Weryfikacja: `typecheck`, `lint`.
   - Ręcznie: `/checkout/delivery` (po zalogowaniu) — 299,99 zł: kurier 14,99 zł, razem 314,98 zł; 339,98 zł: kurier Gratis, razem 339,98 zł; paczkomat 9,99 zł w obu.
3. **Płatność** — `deliveryCost` przez `calculateOrderTotals`; kwota „Razem” zgodna z serwerem. Bez zmiany treści `* Cena zawiera dostawę.`
   - Weryfikacja: `typecheck`, `lint`, `tests/e2e/baseline.spec.ts` nadal oczekuje 314,98 (uruchomienie po zgodzie).
   - Ręcznie: `/checkout/payment` — kwota zgodna z krokiem dostawy.
4. **Sukces i historia zamówień** — `formatDeliveryCost` zamiast `formatPrice` dla wiersza „Dostawa”.
   - Weryfikacja: `typecheck`, `lint`.
   - Ręcznie: zamówienie ≥ 300 zł kurierem → „Gratis”; zamówienie z 14,99 zł bez zmian.
5. **Dokumentacja** — `docs/product-contract.md`, sekcja „Dostawa i zamówienie” (próg, gratis tylko kurier, liczenie na nowo).
6. **E2E** (*zależy od: 1-4*) — patrz plan testów.

## Postęp (stan na 2026-10-07)

- [x] **1. Koszyk** — `CartSummary`: wiersz „Dostawa” („Od 9,99 zł; gratis kurierem od 300 zł”), natywny `<progress>`, komunikaty „Brakuje X zł…” / „Masz darmową dostawę kurierem DHL”. Commit WIP (hash w następnym etapie).
- [ ] **2. Strona dostawy** — nierozpoczęty.
- [ ] **3. Płatność** — nierozpoczęty.
- [ ] **4. Sukces i historia zamówień** — nierozpoczęty.
- [ ] **5. Dokumentacja** — nierozpoczęty.
- [ ] **6. E2E** — nierozpoczęty.

**Weryfikacja:** `typecheck` i `lint` przechodzą. Nie uruchamiano: `test:unit`, `test:e2e`, `build`. Nie sprawdzano w przeglądarce przez agenta (ręcznie zaakceptowano kod).

**Uwaga:** UI pozostałych kroków checkoutu nadal liczy kuriera po staremu (14,99 zł) do końca etapów 2-4.

## Plan testów
- Unit: bez nowych (logika progu i „Gratis” już pokryta w `tests/unit/checkout.test.ts`; brakująca kwota to jedno odejmowanie inline i jest widoczna w E2E).
- E2E (propozycja, do zatwierdzenia w etapie 6): jeden scenariusz — koszyk gościa: słuchawki + świeca → „Masz darmową dostawę…”; usunięcie świecy → „Brakuje 0,01 zł…”; dodanie świecy, logowanie, dostawa „Gratis”, płatność, `order.deliveryCost` = 0, sprzątanie zamówienia i koszyka w teście. `tests/e2e/baseline.spec.ts` bez zmian.
- Etapy 2-4 bez osobnych testów: pokrywa je scenariusz E2E z etapu 6.

## Dokumentacja
- `docs/product-contract.md` — sekcja „Dostawa i zamówienie” (etap 5).
- `docs/contracts/darmowy-kurier.md` — sekcja „Oczekiwania frontendu” tylko jeśli wyjdzie nowe pole lub stan (na razie brak).

## Poza zakresem
Schemat bazy, katalog, logowanie, mock płatności, paczkomat, rabaty, progi regionalne, migracja starych zamówień, `lib/`, `app/api/`, `tests/integration/`.

## Ryzyka i pytania otwarte
- Zmiana koszyka po zapisie dostawy → koszt liczony na nowo na stronie płatności z `useCart` (nie z `sessionStorage`) → zaplanowane w etapie 3.
- Scalanie koszyka gościa przy logowaniu zmienia sumę → UI liczy z aktualnego koszyka, brak dodatkowej obsługi.
- Lokalne `DELIVERY_OPTIONS` na stronie dostawy to rozjazd klient/serwer → usuwane w etapie 2.
- Test E2E tworzy zamówienie i wymaga środowiska (`workshop:reset` i `dev` wołają `scripts/`, poza zakresem) → zapytam o sposób uruchomienia przed etapem 6.
- Brzmienie komunikatów → do potwierdzenia przez PO.
