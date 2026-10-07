# Kontrakt: limit ilości produktu w koszyku

Status: backend zaimplementowany (2026-10-07), treści komunikatów do zatwierdzenia przez Olę. Źródło reguł: odpowiedzi Oli w analizie zgłoszenia (2026-10-07).

## Reguła

`limit(produkt) = min(10, product.stock)`

- Dotyczy koszyka gościa (localStorage) i zalogowanego (baza).
- Zmniejszenie ilości i usunięcie pozycji są zawsze dozwolone, także dla pozycji ponad limit.
- Pozycje już ponad limit nie są migrowane; blokowane jest dalsze zwiększanie i checkout.

## Operacje serwerowe (`lib/actions/cart.ts`, `lib/cart.ts`, `lib/orders.ts`)

Kształt błędu zostaje `{ error: string }`, bez `code`. Akcje w `lib/actions/cart.ts` to cienkie opakowania (sesja + `revalidatePath`) wokół funkcji z `lib/cart.ts`, które przyjmują `userId`. Reguła limitu: `lib/constants/cart.ts`.

Ilość niecałkowita lub `NaN` w `addToDbCart` i `updateDbCartQuantity` daje `{ error: 'Nieprawidłowa ilość.' }`. W `addToDbCart` ilość <= 0 też jest błędem.

| Operacja | Zachowanie przy `nowa ilość > limit` | Wynik |
|----------|--------------------------------------|-------|
| `addToDbCart(productId, qty)` | Odrzuć całą operację (także gdy `existing + qty > limit`), koszyk bez zmian | `{ error }` |
| `updateDbCartQuantity(productId, qty)` | Odrzuć wzrost ponad limit, ilość bez zmian; zmniejszenie zawsze dozwolone; `qty <= 0` nadal usuwa | `{ error }` |
| `mergeGuestCart(items)` | Przytnij wynik (`max(konto, gość)` lub nowa pozycja) do limitu; pozycje z nieprawidłową ilością i nieistniejące produkty pomiń; produkt o stanie 0 zapisz bez przycinania do 0 (tylko do 10); nie zwracaj błędu | `{ success: true }` |
| `placeOrder` / `createOrder` | Patrz niżej | `PlaceOrderResult` |

### Checkout (`placeOrder`)

Kolejność potwierdzona w implementacji:

1. Pozycje z `stock = 0`: usuń z koszyka konta i kontynuuj z pozostałymi (bez komunikatu o usunięciu). Dotychczasowy błąd KOS-08 znika.
2. Jeśli po kroku 1 koszyk jest pusty: brak zamówienia, błąd „Koszyk jest pusty.”
3. Jeśli jakakolwiek pozycja ma `quantity > min(10, stock)`: przytnij te pozycje do limitu w bazie, zwróć błąd (`CHECKOUT_LIMIT_MESSAGE` w `lib/constants/cart.ts`), **nie twórz zamówienia**, nie wywołuj płatności ani maila.
4. W przeciwnym razie zamówienie powstaje jak dotychczas.

`PlaceOrderResult.unavailableProducts` zostaje w typie dla zgodności, ale nie jest już wypełniane.

## Komunikat odrzucenia

Zawiera limit i dostępną ilość: „Maksymalnie {min(10, stan)} szt. tego produktu (dostępne: {stan}).”, np. dla stanu 4: „Maksymalnie 4 szt. tego produktu (dostępne: 4).”, dla stanu 30: „Maksymalnie 10 szt. tego produktu (dostępne: 30).” Ta sama treść co we frontendzie (`hooks/cart-messages.ts`). Dokładna treść do zatwierdzenia przez Olę; w UI pokazywana bez zmian z odpowiedzi serwera.

## Dane dla frontendu

- Odczyt koszyka zalogowanego (`/api/cart`) już zawiera `product.stock`; frontend używa go do wyliczenia limitu i stanu „niedostępny”.
- Koszyk gościa: pozycja musi nieść stan potrzebny do limitu (decyzja realizacji w fazie frontendu).
- Pozycja ze `stock = 0`: wyszarzona w koszyku, komunikat „Ten produkt nie jest dostępny”, zwiększanie zablokowane, ręczne usuwanie możliwe.

## Oczekiwania frontendu

- Frontend rozróżnia tytuł błędu checkoutu po obecności `code` w `PlaceOrderResult`: z `code` pokazuje "Błąd płatności", bez `code` (błędy koszyka) "Nie udało się złożyć zamówienia". Backend nie powinien dodawać `code` do błędów koszyka bez uzgodnienia, bo zmieni to tytuł w UI.
- Po odrzuconym zamówieniu frontend pobiera koszyk z `/api/cart`, więc przycięte ilości i usunięte pozycje muszą być już zapisane w bazie.
- Frontend pokazuje `error` z `addToDbCart` i `updateDbCartQuantity` bez zmian; komunikat powinien zawierać limit i dostępną ilość.
- `/api/cart` zwraca `product.stock` (używane do limitu i stanu "niedostępny").
