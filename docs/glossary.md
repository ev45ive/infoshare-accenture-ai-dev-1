# Słownik pojęć domenowych

| Pojęcie | Definicja |
|---------|-----------|
| Koszyk gościa | Koszyk niezalogowanego użytkownika, zapisany w `localStorage`. |
| Koszyk konta | Koszyk zalogowanego użytkownika, zapisany w bazie. |
| Scalenie koszyków | Połączenie pozycji koszyka gościa z koszykiem konta po logowaniu. |
| Pozycja koszyka | Produkt wraz z ilością w koszyku. |
| Cena | Całkowita liczba groszy, prezentowana jako PLN. |
| Dostawa | Metoda wysyłki wybierana w checkout: kurier lub paczkomat. |
| Kurier | Metoda dostawy pod adres; koszt bazowy 1499 groszy. |
| Paczkomat | Metoda dostawy do automatu; koszt bazowy 999 groszy. |
| Checkout | Proces zakupu: adres, dostawa, płatność, zamówienie. |
| Zamówienie | Zapisany zakup ze statusem płatności (np. `PAID`) i snapshotem pozycji. |
| Snapshot pozycji | Nazwa, cena i ilość produktu zapisane w momencie zakupu. |
| Status zamówienia | Etap realizacji; pierwszy status po zakupie to `ACCEPTED`. |
| Mock płatności | Lokalna symulacja płatności (`lib/payment.ts`); tryby: normalny, `always_fail`, `always_timeout`. |
| Mock email | Lokalna wiadomość zapisywana zamiast wysyłki (`lib/email.ts`), widoczna w `/debug/emails`. |
| Sesja | Token w cookie HttpOnly, ważny 30 minut. |
| Fixtures | Dane startowe: 3 kategorie, 12 produktów, 1 konto testowe. |
| Reset | Przywrócenie bazy do fixtures (`npm run workshop:reset`). |
| Kontrakt | Dokument opisujący zachowanie lub wymaganie biznesowe (`docs/contracts/`). |
