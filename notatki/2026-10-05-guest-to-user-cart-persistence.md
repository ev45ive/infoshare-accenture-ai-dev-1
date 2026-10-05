# Analiza flow: Gość → Logowanie → Koszyk

**Data:** 2026-10-05  
**Rola:** Gość → Zalogowany użytkownik  
**Fokus:** Czy produkt dodany przez gościa przechodzi do koszyka zalogowanego?

---

## Preconditions

- Aplikacja uruchomiona na `http://127.0.0.1:3100`
- Użytkownik wylogowany (gość)
- Koszyk gościa: pusty
- Konto dostępne: `test@shopeasy.pl` / `Test1234!`

---

## Kroki

### 1. Gość przegląda produkty
- **Akcja:** Nawigacja do `/products`
- **Widoczne:**
  - 12 dostępnych produktów
  - Kategorii: Odzież, Elektronika, Dom i ogród
  - Przyciski „Dodaj do koszyka" dla każdego dostępnego produktu
  - W nagłówku: "Zaloguj się" i "Zarejestruj"

### 2. Gość dodaje produkt do koszyka
- **Akcja:** Kliknie „Dodaj do koszyka" na produkcie: **T-shirt bawełniany BasicTee** (49,99 zł)
- **Rezultat na ekranie:**
  - Przycisk zmienia się na stan aktywny
  - Powinna być notyfikacja o dodaniu (toast/alert)
- **Stan koszyka:** 1 szt., 49,99 zł

### 3. Gość sprawdza koszyk
- **Akcja:** Kliknięcie na link „🛒 Koszyk"
- **Rezultat:**
  - URL: `/cart`
  - Nagłówek: "Koszyk (1 szt.)"
  - Zawartość: **T-shirt bawełniany BasicTee** — 49,99 zł
  - Podsumowanie: 49,99 zł
- **Ważne:** Koszyk gościa zawiera dokładnie 1 produkt

### 4. Gość się loguje
- **Akcja:**
  - Kliknięcie „Zaloguj się" (w nagłówku)
  - E-mail: `test@shopeasy.pl`
  - Hasło: `Test1234!`
  - Potwierdza logowanie (Enter lub klik przycisku)
- **Rezultat:**
  - Logowanie powiodło się
  - URL zmienia się na `/cart`
  - Nagłówek zmienia się: zamiast „Zaloguj się" widać „👤 Jan Testowy" + przycisk „Wyloguj"

### 5. Zalogowany użytkownik sprawdza koszyk
- **Akcja:** Automatyczne przekierowanie do `/cart` po logowaniu
- **Rezultat:** ⚠️ **KOSZYK JEST PUSTY**
  - Nagłówek: "Twój koszyk jest pusty"
  - Komunikat: "Dodaj produkty do koszyka, aby kontynuować zakupy."
  - Produkt T-shirt bawełniany **zniknął**

---

## Postconditions

- ✅ Użytkownik zalogowany (Jan Testowy)
- ✅ Aplikacja działa
- ❌ Produkt dodany przez gościa nie przeniósł się do koszyka zalogowanego

---

## Diagram

```mermaid
graph TD
    A["👤 Gość<br/>Brak sesji"] -->|Przegląda produkty| B["Strona produktów<br/>/products"]
    B -->|Dodaje T-shirt<br/>49,99 zł| C["Koszyk gościa<br/>/cart<br/>(1 szt.)"]
    C -->|Kliknie Zaloguj| D["Strona logowania<br/>/login"]
    D -->|test@shopeasy.pl<br/>Test1234!| E["Przekierowanie"]
    E -->|Zalogowany<br/>Jan Testowy| F["Koszyk zalogowanego<br/>/cart<br/>(PUSTY!)"]
    
    style A fill:#e1f5ff
    style C fill:#fff9c4
    style F fill:#ffcdd2
```

---

## Liczby kontrolne

| Etap | Stan koszyka | Ilość | Wartość |
|------|---|---|---|
| Gość — przed | pusty | 0 szt. | 0,00 zł |
| Gość — po dodaniu | z T-shirt | 1 szt. | 49,99 zł |
| Zalogowany — po logowaniu | **PUSTY** | 0 szt. | 0,00 zł |

---

## 🚨 WNIOSKI

### Co się stało?
Produkt dodany przez gościa **nie został zsynchronizowany** z koszykiem zalogowanego użytkownika.

### Możliwe przyczyny
1. **Brak mapowania** koszyka gościa → zalogowany użytkownik
2. **Różne magazyny danych** — gość: localStorage/session vs. zalogowany: baza danych
3. **Logowanie czyści koszyk** — zamierzone zachowanie (np. ze względów bezpieczeństwa)
4. **Bug** — niezamierzone zachowanie

### Co należy sprawdzić
- [ ] Czy istnieje feature do przesyłania koszyka gościa przy logowaniu?
- [ ] Jaki magazyn używa gość? (localStorage, sessionStorage, Zustand, itp.)
- [ ] Jaki magazyn używa zalogowany? (Zustand, baza danych, sesja?)
- [ ] Czy to jest oczekiwane zachowanie w product-contract.md?
- [ ] Czy istnieją testy dla tego flow?

---

## Status

- **PASS/FAIL:** ❌ FAIL — Koszyk gościa nie przechodzi do zalogowanego
- **Priorytet:** 🔴 WYSOKI — User experience: tracenie zawartości koszyka
- **Rekomendacja:** Dodać synchronizację koszyka gościa przy logowaniu
