# Analiza: wdrożenie darmowego kuriera (frontend + dokumentacja + E2E)

## Cel i ustalenia

- Zgłoszenie PO (Kamil): klient widzi właściwą kwotę dostawy, a zamówienie zapisuje ten sam koszt.
- „Uzgodniony kontrakt” = [docs/plan-darmowy-kurier.md](plan-darmowy-kurier.md) (próg 300 zł, tylko kurier DHL, paczkomat 9,99 zł bez zmian).
- Backend jest gotowy (kroki 1-2 oraz testy unit i integracyjny). Pozostaje rozjazd: UI nadal liczy kuriera jako 14,99 zł.
- Ustalenia z doprecyzowania:
  - Wiersz „Dostawa” w koszyku przed wyborem metody: „Od 9,99 zł; gratis kurierem od 300 zł”.
  - Poniżej progu: „Brakuje X zł do darmowej dostawy”. Po osiągnięciu progu: „Masz darmową dostawę kurierem DHL”.
  - Koszt liczony na nowo na każdym kroku z aktualnego koszyka (w `sessionStorage` tylko id metody).
  - Stare zamówienia bez zmian; 0 zł w nowych pokazujemy jako „Gratis”.
  - Poprawki backendu dopuszczone, jeśli wyjdą w trakcie.

## Backend (zakres)

- Brak zaplanowanych zmian. Do sprawdzenia w trakcie: spójność `placeOrder` z kwotą pokazywaną w UI.

## Frontend (zakres)

- [components/cart/CartSummary.tsx](../components/cart/CartSummary.tsx): wiersz „Dostawa”, brakująca kwota, komunikat po osiągnięciu progu.
- [app/(shop)/checkout/delivery/page.tsx](../app/(shop)/checkout/delivery/page.tsx): usunąć lokalne `DELIVERY_OPTIONS`, użyć `calculateOrderTotals`, „Gratis” z przekreśloną ceną 14,99 zł, przeliczenie sumy.
- [app/(shop)/checkout/payment/page.tsx](../app/(shop)/checkout/payment/page.tsx): kwota wspólną funkcją zamiast `cost` z `DELIVERY_OPTIONS`.
- [app/(shop)/checkout/success/page.tsx](../app/(shop)/checkout/success/page.tsx) i [app/(shop)/account/orders/[id]/page.tsx](../app/(shop)/account/orders/[id]/page.tsx): `formatDeliveryCost` zamiast `formatPrice` dla dostawy.
- Dokumentacja: sekcja „Dostawa i zamówienie” w [docs/product-contract.md](product-contract.md).
- Test E2E: próg i powrót do 14,99 zł po spadku poniżej progu; `tests/e2e/baseline.spec.ts` bez zmian (29999 gr).

## Kontrakt wspólny

[docs/contracts/darmowy-kurier.md](contracts/darmowy-kurier.md)

## Kolejność

Tylko frontend (backend gotowy), następnie dokumentacja i E2E. Powód: źródło prawdy i zapis zamówienia już istnieją, brakuje wyłącznie prezentacji.

## Poza zakresem

Schemat bazy, katalog, logowanie, mock płatności, paczkomat, rabaty, progi regionalne, migracja starych zamówień.

## Pytania otwarte

- Brak. Do potwierdzenia przez PO: dokładne brzmienie komunikatów z tabeli w kontrakcie (ustalone w analizie, nie podane w zgłoszeniu).
