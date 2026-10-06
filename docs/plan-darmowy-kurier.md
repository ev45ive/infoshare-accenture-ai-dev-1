# Plan: Darmowy kurier DHL od 300 zł

## Decyzje (zatwierdzone)
- Próg: suma produktów >= 300,00 zł (30000 gr), bez dostawy.
- Tylko kurier DHL (paczkomat 9,99 zł bez zmian).
- Koszyk pokazuje pasek/komunikat "Brakuje X zł do darmowej dostawy".

## Kroki
1. **Źródło prawdy** (blokuje resztę): `lib/constants/checkout.ts` — stała progu 30000 + jedna funkcja kosztu dostawy (metoda, suma produktów).
2. **Backend** (po 1): `lib/actions/checkout.ts` — użyć funkcji do obliczenia `total`, `deliveryCost` i wiersza w e-mailu (0 zł = "Gratis").
3. **Frontend** (równolegle, po 1):
   - `components/cart/CartSummary.tsx` — komunikat/pasek postępu.
   - `app/(shop)/checkout/delivery/page.tsx` — usunąć lokalne `DELIVERY_OPTIONS`, "Gratis" z przekreśloną ceną 14,99 zł, przeliczenie sumy.
   - `app/(shop)/checkout/payment/page.tsx` — kwota wspólną funkcją (w `sessionStorage` tylko id metody).
   - Sukces i historia zamówień — `deliveryCost` = 0 jako "Gratis".
4. **Dokumentacja**: `docs/product-contract.md`, sekcja "Dostawa i zamówienie".
5. **Testy** (po 2-3):
   - Unit: 29999/30000/30001 gr, kurier i paczkomat.
   - Integracyjny: zakup >= 300 zł → `deliveryCost` = 0.
   - E2E: próg i spadek poniżej progu po usunięciu produktu.
   - `tests/e2e/baseline.spec.ts` bez zmian (1499 przy 29999).

## Poza zakresem
Schemat bazy, katalog, logowanie, mock płatności, paczkomat, rabaty, progi regionalne, migracja starych zamówień.

## Ryzyka
- Rozjazd klient/serwer (zduplikowane `DELIVERY_OPTIONS` w `app/(shop)/checkout/delivery/page.tsx`).
- Próg graniczny: 29999 vs 30000.
- Zmiana koszyka po zapisie dostawy w `sessionStorage` — koszt musi być liczony na nowo, nie zapisany.
- Scalanie koszyków gościa i konta przy logowaniu zmienia sumę, a więc prawo do gratisu.
- Historyczne zamówienia i e-mail z 0 zł muszą wyświetlać "Gratis".

## Weryfikacja
- `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`
- Ręcznie: suma 299,99 zł (kurier 14,99 zł), 300,00 zł (gratis), 300,01 zł (gratis), paczkomat zawsze 9,99 zł.
- Dla gościa i zalogowanego.
- Spadek poniżej progu po zmniejszeniu koszyka — powrót ceny do 14,99 zł.

## Do ustalenia
Tekst wiersza "Dostawa" w koszyku przed wyborem metody (dziś niejasny, bo koszt wybiera się w checkout).
