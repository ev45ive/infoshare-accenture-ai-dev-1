# ShopEasy — kontrakt produktu bazowego W01

Ten dokument opisuje zachowanie bazowego środowiska, nie nowe wymagania poszczególnych ćwiczeń. Wersja: W01 / 0.1.

## Katalog i dane

Cena jest całkowitą liczbą groszy, prezentowaną jako PLN. Katalog odczytuje produkty i kategorie z SQLite. Dostępne są wyszukiwanie, filtr kategorii, dostępności, sortowanie oraz paginacja. Szczegóły produktu pokazują nazwę, opis, cenę i dostępność. Obrazy są lokalne i nie wymagają dostępu do zewnętrznego serwisu. W fixtures są trzy kategorie, 12 produktów i jeden produkt ze stanem zero.

ID i wartości fixtures są stabilne po resecie. Identyfikatory nowych zdarzeń i czasy ich utworzenia powstają podczas działania; nie należy porównywać ich do jednej zapamiętanej wartości. Konto testowe jest aktywne po seeding; nowe konta wymagają weryfikacji lokalną wiadomością.

## Koszyk i sesja

Koszyk gościa jest zapisany w localStorage, koszyk zalogowanego w bazie. Po logowaniu pozycje gościa są łączone z koszykiem konta; dla istniejącej pozycji obecna implementacja wybiera większą ilość. Limit wynosi pięć różnych produktów. Widoczny koszt koszyka jest sumą cen produktów razy ilość; dostawa jest wybierana w checkout.

Sesja trwa 30 minut. Serwer sprawdza podpis i wygaśnięcie tokenu. Cookie jest HttpOnly; klient pobiera stan konta z /api/auth/session. Proxy chroni wejście do konta i checkout, a operacje serwerowe weryfikują użytkownika. Jest to lokalne środowisko warsztatowe, bez integracji z firmowym systemem tożsamości. Reset sekretu i bazy poprzedza reset cookie przeglądarki.

## Dostawa i zamówienie

W bazowym kontrakcie kurier kosztuje 1499 groszy, paczkomat 999. Razem to koszt produktów plus wybrana dostawa. Adres i wybrana metoda są przechowywane między krokami w sessionStorage; serwer waliduje adres oraz metodę i oblicza kwotę na podstawie danych produktów w bazie.

Płatność normalnego mocka zwraca sukces i identyfikator. Udany zakup zapisuje adres, zamówienie PAID, snapshot nazwy/ceny/ilości oraz pierwszy status ACCEPTED. Następnie opróżnia koszyk konta i tworzy lokalną wiadomość potwierdzającą. Historia konta pokazuje zamówienia tego użytkownika. Odmowa i timeout zwracają błąd mocka.

Podstawowa próba zakupu: słuchawki SoundMax X3 w ilości 1, 29999 groszy, kurier 1499; razem 31498 groszy, czyli 314,98 zł. Te liczby dotyczą fixtures i istniejącego zachowania W01.

## Źródła i zakres

Schemat danych jest w prisma/schema.prisma, fixtures w prisma/seed.ts, odczyty katalogu w lib/products.ts, operacje koszyka i checkout w lib/actions. Frontend jest w app i components. Mocki są w lib/payment.ts oraz lib/email.ts. Bieżące zgłoszenie określa granice zmiany; nie należy rozbudowywać całego produktu na podstawie samego opisu schematu.
