# Reguły testów

W repo nie ma narzędzi do testów komponentów (Vitest, Testing Library). Nie dodawaj ich bez zgody użytkownika. Dostępne warstwy: unit (`tsx --test`), integracja, E2E (Playwright).

## Zasada podziału: każda warstwa sprawdza co innego

| Warstwa | Sprawdza | Nie sprawdza |
|---------|----------|--------------|
| Unit | Czystą logikę wyciągniętą z komponentów: formatowanie, filtrowanie, obliczenia widoczne w UI, walidacje | Renderowania, DOM, przeglądarki |
| E2E | Ścieżkę użytkownika w przeglądarce: widoczność elementów, nawigacja, formularze, stany UI | Wartości brzegowych logiki (to robi unit) |
| Integracja | Backend (akcje, baza). Poza zakresem tego skilla, chyba że etap dotyka backendu | — |

**Nie powtarzaj tego samego scenariusza na dwóch poziomach.** Chcesz przetestować więcej logiki z komponentu? Wyciągnij ją do czystej funkcji i przetestuj jednostkowo. E2E zostaw tylko ścieżkę.

## Co wchodzi w zakres wg rodzaju zmiany

- **Refaktor:** istniejące testy (w tym `tests/e2e/baseline.spec.ts`) muszą przejść bez zmian. Nowy test tylko dla nowego seamu, który wcześniej nie był testowalny.
- **Zmiana UI/zachowania:** unit na wyciągniętą logikę; E2E tylko jeśli zmienia się ścieżka użytkownika lub widoczne zachowanie krytycznego przepływu (koszyk, logowanie, checkout).
- **Nowy widok/komponent:** unit na logikę; E2E na szczęśliwą ścieżkę + najważniejszy stan błędu lub pusty, jeśli widok jest częścią ścieżki zakupowej. Czysto prezentacyjny komponent bez logiki: zapisz jawnie „bez testów automatycznych” i weryfikację ręczną.

Przy planie testów zapisz decyzję o każdej warstwie jawnie, także „bez testu + powód”.

## Reguły pisania testów

- Unit: wartości brzegowe, pusta lista, wartości ujemne/zerowe tam, gdzie mają znaczenie.
- E2E: lokatory po roli i etykiecie (`getByRole`, `getByLabel`, `getByText`), nie po klasach CSS ani strukturze DOM.
- E2E: używaj konta testowego i danych z seeda (AGENTS.md). Dane tworzone w teście sprzątaj; test musi przejść niezależnie od kolejności i nie zostawiać stanu w bazie.
- E2E: asertuj to, co widzi użytkownik (tekst, URL, widoczność), z auto-oczekiwaniem Playwright. Bez `waitForTimeout`.
- Stany błędu symulowane trybami płatności (`workshop:mode`) wymagają zgody użytkownika, bo komenda woła `scripts/` (poza zakresem). Zapytaj, zanim ją uruchomisz.
- Nazwa testu opisuje zachowanie, po polsku, jak istniejące testy.
- Nie osłabiaj ani nie usuwaj istniejących testów, żeby przeszły.

## Plan testów dla etapu (do zatwierdzenia)

Przed pisaniem testów przedstaw użytkownikowi listę:

1. Które testy, na której warstwie i co każdy sprawdza.
2. Co celowo pominięto, bo pokrywa to inna warstwa lub weryfikacja ręczna.
3. Skąd dane i jak sprzątanie.

`[STOP]` do zatwierdzenia, dopiero potem pisz testy.

## Uruchamianie

- Używaj komend z AGENTS.md/README (`test:unit`, `test:e2e`). Nie uruchamiaj skryptów z katalogów poza zakresem. Gdy komenda npm woła taki skrypt, poszukaj alternatywy lub zapytaj.
- E2E wymaga działającego serwera (`http://127.0.0.1:3100`) i bazy w stanie startowym. Jeśli nie wiesz, jak uruchomić środowisko bez skryptów poza zakresem, zapytaj.
- Raportuj faktyczny wynik: liczbę uruchomionych i zaliczonych testów. Jeśli nowy plik testów nie został uruchomiony przez runner (liczba testów się nie zmieniła), zgłoś to, nie zakładaj, że przeszedł.
- Weryfikacja w przeglądarce (zrzuty, klikanie) tylko na prośbę użytkownika.
