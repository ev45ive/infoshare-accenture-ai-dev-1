# Analiza flow: Koszyk gościa → Logowanie → Ponowne otwarcie koszyka

**Rola:** Gość → Zalogowany użytkownik

## Preconditions:
- Użytkownik nie jest zalogowany (gość)
- Aplikacja jest uruchomiona na http://127.0.0.1:3100
- Koszyk gościa jest pusty na starcie
- Test konto: `test@shopeasy.pl` / `Test1234!`

## Kroki:

### 1. Gość dodaje produkt do koszyka
- **Akcja:** Kliknięcie przycisku "Dodaj do koszyka" na produkcie "Donica ceramiczna TerraForm L"
- **Rezultat na ekranie:** Notyfikacja (toast) potwierdzająca dodanie produktu
- **Stan:** Produkt dodany do koszyka gościa

### 2. Gość otwiera koszyk
- **Akcja:** Kliknięcie "🛒 Koszyk" w nawigacji
- **Rezultat na ekranie:**
  - Nagłówek: "Koszyk (1 szt.)"
  - Widoczny produkt: **Donica ceramiczna TerraForm L**, 59,99 zł, ilość: 1
  - Podsumowanie: Łącznie 59,99 zł
- **Stan:** Koszyk zawiera 1 produkt

### 3. Gość się loguje
- **Akcja:** 
  - Kliknięcie "Zaloguj się" w nawigacji
  - Wpisanie: `test@shopeasy.pl`
  - Wpisanie hasła: `Test1234!`
  - Kliknięcie przycisku "Zaloguj się"
- **Rezultat na ekranie:**
  - Przekierowanie na stronę główną (/)
  - Zmiana nawigacji: zamiast "Zaloguj się" / "Zarejestruj" pojawia się "👤 Jan Testowy" i przycisk "Wyloguj"
- **Stan:** Użytkownik zalogowany jako "Jan Testowy"

### 4. Zalogowany użytkownik otwiera koszyk
- **Akcja:** Kliknięcie "🛒 Koszyk" w nawigacji
- **Rezultat na ekranie:**
  - **Nagłówek: "Twój koszyk jest pusty"**
  - Komunikat: "Dodaj produkty do koszyka, aby kontynuować zakupy."
  - Link: "Przeglądaj produkty"
- **Stan:** ❌ **KOSZYK JEST PUSTY** — Produkt zniknął!

## Postconditions (RZECZYWISTE vs OCZEKIWANE)

| Aspekt | Oczekiwane | Rzeczywiste |
|--------|-----------|-----------|
| Produkt w koszyku po logowaniu | Donica ceramiczna TerraForm L (59,99 zł) | Brak produktu |
| Ilość produktów | 1 | 0 |
| Całkowita wartość | 59,99 zł | — (pusty koszyk) |

## 🔴 Wniosek: BUG

**Problem:** Koszyk gościa nie jest transferowany do koszyka zalogowanego użytkownika.

**Oczekiwane zachowanie:** Po zalogowaniu się gościa, produkty dodane przed logowaniem powinny pozostać w koszyku.

## Otwarte kwestie:
- ❓ Czy produkty z koszyka gościa mają być automatycznie przenoszone do koszyka użytkownika po logowaniu?
- ❓ Czy jest to celowe zachowanie (gość = osobny koszyk)?
- ❓ Czy istnieje dokumentacja o tym, jak powinien działać ten flow?
- ❓ Czy problem dotyczy też koszy gościa przechowywanych w localStorage/sessionStorage?

## Ścieżka w kodzie do sprawdzenia:
- [app/(shop)/cart/page.tsx](../../app/(shop)/cart/page.tsx) — strona koszyka
- [app/api/cart/](../../app/api/cart/) — API koszyka
- [lib/actions/cart.ts](../../lib/actions/cart.ts) — akcje koszyka
- [store/cart.ts](../../store/cart.ts) — store koszyka (Zustand/client)
- [lib/session.ts](../../lib/session.ts) — logika sesji/logowania
