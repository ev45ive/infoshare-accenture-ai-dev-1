# Reguły testów

## Zasada podziału: każda warstwa sprawdza co innego

| Warstwa | Sprawdza | Nie sprawdza |
|---------|----------|--------------|
| Unit | Logikę czystych funkcji: obliczenia, progi, wartości brzegowe, formatowanie | Bazy, sesji, usług |
| Integracja | Połączenie: czy akcja/serwis używa logiki, zapisuje wynik w bazie, wywołuje email/płatność | Wartości brzegowych logiki (to robi unit) |
| E2E | Ścieżkę użytkownika w przeglądarce | Logiki ani zapisu (to robią niższe warstwy) |

**Nie powtarzaj tego samego scenariusza na dwóch poziomach.** Jeśli chcesz sprawdzić więcej logiki, przenieś ją do czystej funkcji i przetestuj jednostkowo. Integracji zostaw minimum potrzebne do potwierdzenia połączenia.

## Co wchodzi w zakres wg rodzaju zmiany

- **Refaktor:** istniejące testy muszą przejść bez zmian. Nowy test tylko dla nowego seamu, który wcześniej nie był testowalny.
- **Zmiana funkcjonalności:** unit na nową logikę + wartości brzegowe; 1 test integracyjny potwierdzający zapis/efekt; E2E tylko jeśli zmienia się ścieżka użytkownika (i etap obejmuje frontend).
- **Nowa funkcja:** unit na logikę, integracja na główny przepływ (szczęśliwa ścieżka + najważniejszy błąd), E2E jeśli jest UI.

E2E jest poza zakresem etapu backendowego, chyba że etap obejmuje frontend lub użytkownik wprost o to prosi. Przy planie testów zapisz tę decyzję jawnie.

## Reguły pisania testów

- Unit: wartości brzegowe (poniżej / na / powyżej progu), pusta lista wejściowa, wartości ujemne lub zerowe tam, gdzie mają znaczenie.
- Integracja: używaj danych z seeda (nie twórz produktów/użytkowników, jeśli inne testy zależą od ich liczby). Dane tworzone w teście sprzątaj w `after`.
- Integracja: test musi przejść niezależnie od kolejności i nie zostawiać stanu w bazie.
- Asertuj efekt, który widzi użytkownik lub baza (zapisane wartości, treść emaila), nie szczegóły implementacji.
- Nazwa testu opisuje zachowanie, po polsku, jak istniejące testy.
- Nie osłabiaj ani nie usuwaj istniejących testów, żeby przeszły.

## Plan testów dla etapu (do zatwierdzenia)

Przed pisaniem testów przedstaw użytkownikowi listę:

1. Które testy, na której warstwie i co każdy sprawdza.
2. Co celowo pominięto, bo pokrywa to inna warstwa.
3. Skąd dane i jak sprzątanie.

`[STOP]` do zatwierdzenia, dopiero potem pisz testy.

## Uruchamianie

- Używaj komend z AGENTS.md/README. Nie uruchamiaj skryptów z katalogów poza zakresem.
- Raportuj faktyczny wynik: liczbę uruchomionych i zaliczonych testów. Jeśli nowy plik testów nie został uruchomiony przez runner (liczba testów się nie zmieniła), zgłoś to, nie zakładaj, że przeszedł.
