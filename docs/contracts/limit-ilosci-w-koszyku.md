# Kontrakt: limit ilości produktu w koszyku

Status: szkic do zatwierdzenia. Źródło reguł: odpowiedzi Oli w analizie zgłoszenia (2026-10-07).

## Reguła

`limit(produkt) = min(10, product.stock)`

- Dotyczy koszyka gościa (localStorage) i zalogowanego (baza).
- Zmniejszenie ilości i usunięcie pozycji są zawsze dozwolone, także dla pozycji ponad limit.
- Pozycje już ponad limit nie są migrowane; blokowane jest dalsze zwiększanie i checkout.

## Operacje serwerowe (`lib/actions/cart.ts`, `lib/orders.ts`)

Kształt błędu zachowuje dotychczasowy `{ error: string }`; do ustalenia w fazie backendu, czy dodać `code`.

| Operacja | Zachowanie przy `nowa ilość > limit` | Wynik |
|----------|--------------------------------------|-------|
| `addToDbCart(productId, qty)` | Odrzuć całą operację (także gdy `existing + qty > limit`), koszyk bez zmian | `{ error }` |
| `updateDbCartQuantity(productId, qty)` | Odrzuć, ilość bez zmian; `qty <= 0` nadal usuwa | `{ error }` |
| `mergeGuestCart(items)` | Przytnij wynik (`max(konto, gość)` lub nowa pozycja) do limitu; nie zwracaj błędu | `{ success: true }` |
| `placeOrder` / `createOrder` | Patrz niżej | `PlaceOrderResult` |

### Checkout (`placeOrder`)

1. Pozycje z `stock = 0`: usuń z koszyka konta i kontynuuj z pozostałymi (bez komunikatu o usunięciu).
2. Jeśli po kroku 1 koszyk jest pusty: brak zamówienia, błąd „Koszyk jest pusty.”
3. Jeśli jakakolwiek pozycja ma `quantity > min(10, stock)`: przytnij te pozycje do limitu w bazie, zwróć błąd, **nie twórz zamówienia**.
4. W przeciwnym razie zamówienie powstaje jak dotychczas.

Kolejność kroków 1 i 3 do potwierdzenia w fazie backendu (wynik dla klienta ten sam, o ile oba błędy zachodzą osobno).

## Komunikat odrzucenia

Zawiera limit i dostępną ilość, np. „Maksymalnie 10 szt. tego produktu (dostępne: 4).” Dokładna treść do zatwierdzenia przez Olę; w UI pokazywana bez zmian z odpowiedzi serwera.

## Dane dla frontendu

- Odczyt koszyka zalogowanego (`/api/cart`) już zawiera `product.stock`; frontend używa go do wyliczenia limitu i stanu „niedostępny”.
- Koszyk gościa: pozycja musi nieść stan potrzebny do limitu (decyzja realizacji w fazie frontendu).
- Pozycja ze `stock = 0`: wyszarzona w koszyku, komunikat „Ten produkt nie jest dostępny”, zwiększanie zablokowane, ręczne usuwanie możliwe.

## Oczekiwania frontendu

- Frontend rozróżnia tytuł błędu checkoutu po obecności `code` w `PlaceOrderResult`: z `code` pokazuje "Błąd płatności", bez `code` (błędy koszyka) "Nie udało się złożyć zamówienia". Backend nie powinien dodawać `code` do błędów koszyka bez uzgodnienia, bo zmieni to tytuł w UI.
- Po odrzuconym zamówieniu frontend pobiera koszyk z `/api/cart`, więc przycięte ilości i usunięte pozycje muszą być już zapisane w bazie.
- Frontend pokazuje `error` z `addToDbCart` i `updateDbCartQuantity` bez zmian; komunikat powinien zawierać limit i dostępną ilość.
- `/api/cart` zwraca `product.stock` (używane do limitu i stanu "niedostępny").
