# Reguły implementacji etapu

## Przed edycją

- [ ] Przeczytaj pliki, które zmieniasz, oraz ich użycia (symbole, importy). Nie edytuj na podstawie założeń.
- [ ] Stan plików mógł się zmienić (edycje użytkownika, cofnięcia). Sprawdź aktualną treść przed zmianą.
- [ ] Etap ma jeden cel. Jeśli zmiana rośnie, podziel ją i zapytaj.

## Zakres zmiany

- Rób tylko to, co wynika z etapu. Bez dodatkowych funkcji, porządków i „ulepszeń”.
- Refaktor: zachowanie bez zmian. Zmiana zachowania w trakcie refaktoru = osobny etap.
- Nie dotykaj frontendu, E2E i dokumentacji spoza etapu.
- Nie czytaj i nie zmieniaj ścieżek poza zakresem z AGENTS.md.

## Jakość kodu

- Jedno źródło prawdy dla reguł biznesowych (stałe, wspólne funkcje). Nie duplikuj liczb i progów.
- Logikę biznesową wydzielaj do czystych funkcji bez zależności od frameworka, żeby dało się ją testować jednostkowo i używać po stronie klienta.
- Nazywaj typy zwracane i parametry złożone (bez anonimowych obiektów w sygnaturach publicznych).
- Komentarz tylko tam, gdzie kod nie mówi sam za siebie, jedna krótka linia.
- Obsługa błędów tylko na granicach systemu (wejście użytkownika, baza, usługi zewnętrzne).

## Bezpieczeństwo (Next.js / server actions)

- Plik z `'use server'` eksportuje wyłącznie publiczne akcje. Funkcji przyjmującej tożsamość (np. `userId`, obiekt użytkownika) nie eksportuj stamtąd. Umieść ją w module bez `'use server'`, a akcja wyciąga tożsamość z sesji i ją wywołuje.
- Nie ufaj wartościom z klienta. Kwoty, koszty i uprawnienia licz po stronie serwera.
- Waliduj dane wejściowe na granicy (schematy zod), zanim dotkniesz bazy lub płatności.
- Kolejność: walidacja → obliczenia → efekty uboczne (płatność, zapis, email).

## Po edycji

- [ ] `typecheck` i `lint` bez błędów (komendy z AGENTS.md).
- [ ] Zmiana nie zmienia zachowania poza tym, co zaplanowano.
- [ ] Pokaż użytkownikowi listę zmienionych plików i krótki opis. Nie commituj przed bramką.
