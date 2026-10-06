---
description: "Przeanalizuj przepływ użytkownika w ShopEasy — od kroku początkowego do końcowego stanu. Nawiguj przez UI, dokumentuj dane i interakcje, utwórz diagram Mermaid."
name: "Analizuj User Flow"
argument-hint: "Początkowa ścieżka (np. 'Strona główna') → Końcowy stan (np. 'Zalogowany z produktem w koszyku')"
agent: "agent"
---

## Rola
Fullstack Developer / Tech Lead analizujący przepływ użytkownika w aplikacji ShopEasy.

## Cel
Przeanalizuj wybrany przepływ użytkownika (user flow) od stanu początkowego do końcowego.

## Instrukcje

### 1. Zbierz parametry od użytkownika
Poproś o:
- **Ścieżka początkowa**: Gdzie użytkownik zaczyna? (np. "Strona główna jako gość", "Strona logowania", "Koszyk")
- **Końcowy stan**: Jaki jest cel? (np. "Zalogowany użytkownik", "Produkt dodany do koszyka", "Zamówienie złożone")
- **Opcjonalnie — kroki pośrednie**: Czy są konkretne kroki, które chcesz sprawdzić? (np. "logowanie → dodanie produktu → checkout")

### 2. Przejdź przez przepływ w przeglądarce
- **Zawsze używaj `open_browser_page`** do otwarcia aplikacji (nie Playwright)
- Otwórz: http://127.0.0.1:3100
- Nawiguj zgodnie z opisanym przepływem przy użyciu dostępnych narzędzi przeglądarki (read_page, click_element, type_in_page, navigate_page)
- Na każdym kroku zanotuj:
  - URL i widoczne elementy
  - Dane wyświetlane na ekranie (produkty, ceny, komunikaty)
  - Akcje wykonane przez użytkownika (klik, wpisanie tekstu, submit)

### 2.5 Obsługa brakujących danych
- **Ekrany mogą chwilowo pokazywać brak danych** (pusty stan, bez komunikatu Loading)
- W takiej sytuacji:
  1. **Czekaj 3 sekundy**
  2. **Spróbuj ponownie odczytać ekran** (`read_page`)
  3. Jeśli **dane nadal brakują**:
     - ⚠️ **Zapytaj użytkownika:**
       - "Dane się nie załadowały. Czy chcesz: (a) spróbować ponownie, (b) kontynuować bez tych danych, (c) zgłosić błąd i zakończyć?"
     - Działaj zgodnie z odpowiedzią
     - Jeśli (c) → zapisz analizę do pliku i zakończ

### 3. Obsługa błędów i problemów
- **Jeśli wykryjesz błąd, niezgodność lub problem:**
  - ❌ **NIE próbuj debugować ani rozwiązywać**
  - ⚠️ **Zatrzymaj się i zapytaj użytkownika:**
    - "Wykryłem problem: [opis]. Czy chcesz: (a) kontynuować pomimo błędu, (b) zgłosić błąd i zakończyć analizę?"
  - Działaj zgodnie z odpowiedzią
  - Jeśli (b) → zapisz dotychczasową analizę do pliku i zakończ

### 4. Dokumentuj przepływ w Markdown

```
# Analiza flow — [NAZWA PRZEPŁYWU]

**Rola:** [Role użytkownika]

## Preconditions:
- [Stan aplikacji na start]

## Kroki:
1. [Użytkownik robi X]
   - Widoczne dane: ...
   - Rezultat: ...

[... więcej kroków ...]

## Postconditions:
- [Efekt końcowy]

## Diagram

[ diagram mermaid ]

## Założenia:
- ...

## Otwarte kwestie:
- ...
```

### 5. Utwórz diagram Mermaid
- Jeśli przepływ ma > 4 kroki, rozbij na kilka mniejszych diagramów
- Użyj `graph LR` (lewo-prawo) dla jasności
- Zaznacz warunki i decyzje

### 6. Podsumowanie
Wyświetl tabelę:
| Etap | Rezultat | Status |
|------|----------|--------|
| [krok 1] | [rezultat] | ✅/❌ |
| [krok 2] | [rezultat] | ✅/❌ |

---

## Zasady

### Narzędzia przeglądarki
- ✅ Zawsze używaj: `open_browser_page`, `read_page`, `click_element`, `type_in_page`, `navigate_page`
- ❌ NIE używaj: Playwright (`run_playwright_code`)

### Obsługa ekranów i danych
- Ekrany **mogą chwilowo być puste** (brak Loading state)
- Zawsze czekaj 3s i spróbuj ponownie (`read_page`)
- Jeśli dane nadal brakują → **pytaj użytkownika o decyzję** narzędziem #askQuestions

### Błędy i problemy
- Jeśli coś nie działa → **NIE debuguj**
- Zawsze zatrzymaj się i **pytaj użytkownika** o dalsze kroki narzędziem #askQuestions
- Zapisz analizę do pliku jeśli użytkownik zdecyduje na zakończenie

### Konto i baza danych
- **Konto testowe**: `test@shopeasy.pl` / `Test1234!`
- **Reset bazy**: `npm run workshop:reset`

### Warunki zakonczenia
- ✅ Przepływ osiągnął końcowy stan → podsumowanie + propozycja zapisu
- ⚠️ Brakujące dane → zapytaj użytkownika
- ❌ Błąd/problem → zapytaj użytkownika + zapisz dotychczasową analizę

## Koniec
- Wyświetl podsumowanie (tabelka ze statusami)
- Pytaj: *"Czy chcesz zapisać tę analizę do pliku?"* narzędziem #askQuestions
- Jeśli tak → zapisz do `./notatki/<data>-<nazwa-flow>.md`
