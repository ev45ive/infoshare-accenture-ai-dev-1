# Analiza: limit ilości produktu w koszyku (max 10 / stan)

Źródło: zgłoszenie Oli „Nie więcej niż 10 sztuk produktu”. Analiza przepływu danych: [notatki/2026-10-07-limit-10-sztuk-kod.md](../notatki/2026-10-07-limit-10-sztuk-kod.md).

## Cel i ustalenia

Cel: reguła „maks. 10 sztuk jednego produktu z uwzględnieniem stanu” chroniona w całym koszyku, nie tylko w kontrolkach UI, z dowodami, że zwykła operacja koszyka jej nie omija.

Ustalone z użytkownikiem (odpowiedzi w imieniu Oli):
- Limit efektywny: `min(10, dostępny stan)`.
- Przekroczenie przy dodaniu/zmianie ilości: odrzucenie operacji z komunikatem, koszyk bez zmian. Komunikat zawiera limit i dostępną ilość.
- Dotyczy koszyka gościa i zalogowanego.
- Łączenie koszyków po logowaniu: wynik przycinany do limitu.
- Pozycje już ponad limit: bez migracji; blokada dalszego zwiększania i checkoutu z komunikatem „max 10”.
- Zmniejszanie ilości zawsze dozwolone.
- Stan 0 w koszyku: pozycja wyszarzona + komunikat „ten produkt nie jest dostępny”, usuwana ręcznie; w checkout usuwana automatycznie, zamówienie składane z pozostałych pozycji, bez informowania o usunięciu. Pusty koszyk po usunięciu: brak zamówienia, komunikat o pustym koszyku.
- Ilość ponad limit w checkout (w tym ponad stan przy stanie > 0): błąd, pozycja przycięta do limitu, zamówienie nie powstaje.
- Wyszarzenie stanu 0 tylko w koszyku.
- Dowody: testy integracyjne (bezpośrednie wywołania akcji), testy jednostkowe reguły, test E2E, krótki raport w mailu.
- Priorytet/termin: brak informacji, do ustalenia z Olą.

## Backend (zakres)

- Jedna reguła limitu współdzielona przez wszystkie ścieżki zapisu ilości.
- `addToDbCart`, `updateDbCartQuantity`: odrzucenie przy przekroczeniu limitu (zachowanie w [kontrakcie](../docs/contracts/limit-ilosci-w-koszyku.md)).
- `mergeGuestCart`: przycięcie do limitu.
- `placeOrder`: usunięcie pozycji ze stanem 0, kontynuacja zamówienia; przycięcie + błąd przy ilości ponad limit; pusty koszyk po usunięciu → brak zamówienia.
- Dowody: testy jednostkowe reguły, testy integracyjne wywołujące akcje serwerowe bezpośrednio (omijając UI): dodanie ponad 10, kumulacja `existing + qty`, zmiana ilości, ponad stan, merge, checkout (stan 0, ilość ponad limit, pusty koszyk), pozycja ponad limit sprzed zmiany. Zgodnie z [integration-tests.instructions.md](../.github/instructions/integration-tests.instructions.md).

## Frontend (zakres)

- Kontrolki zgodne z regułą: ilość i „+” liczone z `min(10, stan)` (dziś „+” zna tylko 10, bez stanu).
- Wyświetlanie komunikatu odrzucenia z serwera (w tym na `/cart`) oraz komunikatu przy błędzie checkoutu.
- Pozycja ze stanem 0 w koszyku: wyszarzona, komunikat „Ten produkt nie jest dostępny”, zwiększanie zablokowane, ręczne usuwanie działa.
- Koszyk gościa: limit egzekwowany po stronie klienta (patrz pytanie otwarte 1).
- Dowód: test E2E (Playwright) dla ścieżki w przeglądarce.

## Kontrakt wspólny

[docs/contracts/limit-ilosci-w-koszyku.md](../docs/contracts/limit-ilosci-w-koszyku.md)

## Kolejność

backend → frontend. Powód: UI renderuje komunikaty i stany wynikające z odpowiedzi serwera (kształt błędu, przycięcie w checkout), a ochrona reguły jest głównym celem zgłoszenia.

## Poza zakresem

- Limit 5 różnych pozycji (BR-01) i konto Premium.
- Zmiana kosztów, dostawy, płatności.
- Migracja istniejących danych koszyka ponad limit.
- Informowanie klienta o pozycjach usuniętych w checkout.
- Wyszarzanie niedostępnego produktu na liście/karcie produktu.

## Pytania otwarte

1. Koszyk gościa jest w localStorage, więc serwer go nie widzi do momentu merge. Czy egzekwowanie po stronie klienta (plus przycięcie w merge i błąd w checkout) jest akceptowalne jako „ochrona w całym koszyku” dla gościa? Alternatywa wymaga zmiany sposobu przechowywania koszyka gościa (osobne zgłoszenie).
2. Co przy merge z produktem o stanie 0 (pominąć pozycję, zapisać z ilością 0, zapisać bez zmian)?
3. Czy przy `qty` niecałkowitej, ujemnej lub `NaN` w operacjach serwerowych odrzucać z błędem (propozycja, nie ustalone)?
4. Czy Ola zatwierdza dokładną treść komunikatu (np. „Maksymalnie 10 szt. tego produktu (dostępne: 4).”) i komunikatu „Ten produkt nie jest dostępny”?
5. Zamówienie dziś nie zmniejsza stanu produktu. Czy jest to w porządku dla tej reguły (limit liczony od stanu bez zmniejszania po zakupie)?
6. Priorytet i termin.
