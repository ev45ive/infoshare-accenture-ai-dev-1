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
- Uruchom aplikację: http://127.0.0.1:3100
- Nawiguj zgodnie z opisanym przepływem
- Na każdym kroku zanotuj:
  - URL i widoczne elementy
  - Dane wyświetlane na ekranie (produkty, ceny, komunikaty)
  - Akcje wykonane przez użytkownika (klik, wpisanie tekstu, submit)

### 3. Dokumentuj przepływ w Markdown

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

### 4. Utwórz diagram Mermaid
- Jeśli przepływ ma > 4 kroki, rozbij na kilka mniejszych diagramów
- Użyj `graph LR` (lewo-prawo) dla jasności
- Zaznacz warunki i decyzje

### 5. Zaproponuj zapis
- Zasugeruj domyślną ścieżkę: `./notatki/RRRR-MM-DD-<nazwa-flow>.md`
- Pytaj użytkownika, czy chce zapisać
- Jeśli tak → zapisz plik

### 6. Podsumowanie
Wyświetl tabelę:
| Etap | Rezultat | Status |
|------|----------|--------|
| [krok 1] | [rezultat] | ✅/❌ |
| [krok 2] | [rezultat] | ✅/❌ |

---

## Zasady

- **Jeśli dane się nie załadowały**: Spróbuj ponownie za 2 sekundy (np. "Koszyk pusty" → 2s → odczytaj treść strony ponownie )
- **Nieoczekiwane błędy**: Zaznacz jako `❌` w podsumowaniu i dodaj do "Otwarte kwestie"
- **Konto testowe**: `test@shopeasy.pl` / `Test1234!`
- **Baza danych**: Reset poprzez `npm run workshop:reset`

## Koniec
Pytaj: *"Czy chcesz zapisać tę analizę do pliku?"*
