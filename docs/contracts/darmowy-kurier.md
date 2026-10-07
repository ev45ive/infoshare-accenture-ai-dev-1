# Kontrakt: darmowy kurier DHL od 300 zł

Wspólne reguły dla backendu i frontendu. Zatwierdzone przez PO (Kamil). Źródło decyzji: [docs/plan-darmowy-kurier.md](../plan-darmowy-kurier.md).

## Reguły

- Próg: suma produktów (bez dostawy) >= 30000 gr włącznie.
- Gratis dotyczy tylko `COURIER`. `PARCEL_LOCKER` zawsze 999 gr.
- Poniżej progu kurier kosztuje 1499 gr.
- Kwotę zawsze liczy `calculateDeliveryCost` / `calculateOrderTotals` z `lib/constants/checkout.ts`. Zakaz lokalnych kopii cen i `DELIVERY_OPTIONS`.
- W `sessionStorage` zapisujemy wyłącznie id metody. Koszt jest liczony na nowo z aktualnego koszyka na każdym kroku.
- Serwer przy zapisie zamówienia liczy kwotę sam; kwota z klienta nie jest źródłem prawdy.

## Prezentacja

| Miejsce | Zachowanie |
|---------|------------|
| Koszyk, wiersz „Dostawa” (metoda jeszcze niewybrana) | „Od 9,99 zł; gratis kurierem od 300 zł” |
| Koszyk, poniżej progu | „Brakuje X zł do darmowej dostawy” (pasek/komunikat) |
| Koszyk, próg osiągnięty | „Masz darmową dostawę kurierem DHL” |
| Dostawa, kurier >= progu | „Gratis” + przekreślone 14,99 zł; suma bez dostawy |
| Dostawa, kurier < progu | 14,99 zł |
| Płatność, sukces, szczegóły zamówienia | `formatDeliveryCost`: 0 gr = „Gratis” |
| E-mail potwierdzający | „Gratis” (już zaimplementowane w `lib/orders.ts`) |

## Przypadki graniczne

- 29999 gr: kurier 1499 gr, razem 31498 gr w zakupie bazowym (słuchawki SoundMax X3) pozostaje bez zmian.
- 30000 i 30001 gr: kurier 0 gr.
- Spadek poniżej progu po zmianie koszyka: kurier wraca do 1499 gr.
- Zamówienia sprzed zmiany: bez migracji; wartości zapisane w bazie wyświetlane bez zmian.

## Kształt wyniku zamówienia

`createOrder` (`lib/actions/checkout.ts`) i `placeOrder` (`lib/orders.ts`) zwracają `PlaceOrderResult` (`lib/orders.ts`):

- sukces: `{ success: true, orderId, orderNumber }`,
- błąd: `{ success: false, error, code?, fieldErrors?, unavailableProducts? }`.

Dyskryminator to `result.success`. Sprawdzanie przez `'success' in result` nie rozróżnia już sukcesu od błędu.
