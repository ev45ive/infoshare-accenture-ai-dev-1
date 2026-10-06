# Reguły implementacji etapu

## Przed edycją

- [ ] Przeczytaj pliki, które zmieniasz, oraz ich użycia (importy, miejsca renderowania). Nie edytuj na podstawie założeń.
- [ ] Przejrzyj sąsiednie komponenty i `components/ui/`: użyj istniejących zamiast pisać nowe.
- [ ] Stan plików mógł się zmienić (edycje użytkownika, cofnięcia). Sprawdź aktualną treść przed zmianą.
- [ ] Etap ma jeden cel. Jeśli zmiana rośnie, podziel ją i zapytaj.

## Zakres zmiany

- Rób tylko to, co wynika z etapu. Bez dodatkowych funkcji, porządków i „ulepszeń”.
- Refaktor: wygląd i zachowanie bez zmian. Zmiana w trakcie refaktoru = osobny etap.
- Nie zmieniaj backendu (`lib/actions/`, `lib/`, `prisma/`) poza etapem. Brakujący kontrakt zgłoś pytaniem.
- Nie czytaj i nie zmieniaj ścieżek poza zakresem z AGENTS.md.

## Komponenty i Next.js

- Granica serwer/klient: `'use client'` tylko tam, gdzie potrzebny stan, efekty lub handlery. Sprawdź konwencję sąsiednich plików w danym katalogu, zanim wybierzesz typ komponentu.
- Do klienta nie trafiają sekrety ani logika, której wynik musi być wiarygodny (kwoty, uprawnienia). UI pokazuje to, co policzył serwer, lub używa wspólnej czystej funkcji z `lib/`.
- Nie duplikuj reguł biznesowych (progi, stawki) w komponentach: importuj stałe/funkcje z `lib/`.
- Stan: najpierw sprawdź `store/cart.ts` i `hooks/useCart.ts`. Nie wprowadzaj nowego stanu globalnego, jeśli wystarczy stan lokalny lub istniejący store.
- Formularze: `react-hook-form` + schematy `zod` z `lib/validations/`, jeśli schemat już istnieje. Komunikaty błędów po polsku, powiązane z polem.
- Powiadomienia: `sonner`. Ikony: `lucide-react`. Style: Tailwind, bez inline `style`, bez nowych bibliotek bez zgody.
- Typy: propsy komponentów nazwane (`type XxxProps`), typy współdzielone w `types/index.ts`.

## shadcn/ui na `@base-ui/react` (style `base-nova`)

- Brak `asChild`. Polimorfizm przez prop `render`: `<Button render={<Link href="/x" />}>Tekst</Button>`; dzieci przekazuj do zewnętrznego komponentu.
- Przy `render` innym niż `<button>` dodaj `nativeButton={false}`.
- Nie zagnieżdżaj `<Button>` w `Trigger` (Trigger sam renderuje `<button>`): użyj `render={<Button />}` na Triggerze.
- Przed użyciem komponentu sprawdź jego API w `components/ui/` (to kod źródłowy w repo, nie zakładaj API Radix).
- Nie edytuj `components/ui/` bez potrzeby etapu.

## Stany UI (obowiązkowe)

Dla każdego widoku lub komponentu z danymi/akcją opisz i zaimplementuj:

- [ ] ładowanie / akcja w toku (przycisk zablokowany, brak podwójnego wysłania),
- [ ] pusty stan (np. pusty koszyk, brak wyników),
- [ ] błąd (komunikat zrozumiały dla użytkownika, możliwość ponowienia tam, gdzie ma sens),
- [ ] sukces/potwierdzenie.

Brak decyzji o którymś stanie = pytanie, nie domysł.

## Dostępność (checklista)

- [ ] Natywne elementy wg roli: `button` dla akcji, `a`/`Link` dla nawigacji.
- [ ] Każde pole formularza ma powiązaną etykietę (`Label` + `htmlFor`), błędy powiązane z polem (`aria-describedby`/`aria-invalid`).
- [ ] Przyciski ikonowe mają nazwę dostępną (`aria-label`).
- [ ] Obrazy mają sensowne `alt` (dekoracyjne: pusty).
- [ ] Obsługa klawiaturą i widoczny fokus; dialogi zwracają fokus.
- [ ] Informacja nie opiera się wyłącznie na kolorze.
- [ ] Nazwy dostępne zgodne z tym, czego szukają testy E2E (`getByRole`, `getByLabel`).

## Jakość kodu

- Komentarz tylko tam, gdzie kod nie mówi sam za siebie, jedna krótka linia.
- Obsługa błędów tylko na granicach (wywołania akcji/API, wejście użytkownika).
- Teksty UI po polsku, spójne z istniejącymi widokami.

## Po edycji

- [ ] `typecheck` i `lint` bez błędów (komendy z AGENTS.md).
- [ ] Zmiana nie zmienia wyglądu/zachowania poza tym, co zaplanowano.
- [ ] Pokaż użytkownikowi listę zmienionych plików, krótki opis i **kroki ręcznej weryfikacji w UI** (adres, akcje, oczekiwany widok). Nie commituj przed bramką.
