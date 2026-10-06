---
name: frontend-implementation
description: 'Planuje i wdraża zmianę frontendu etapami z bramkami weryfikacji przez człowieka: refaktor, zmiana UI/zachowania lub nowy widok. Use when: plan zmiany UI, implementacja frontendu, komponenty React, strony Next.js (app/), formularze, koszyk/checkout w UI, shadcn/ui, Tailwind, stany loading/empty/error, dostępność (a11y), testy E2E Playwright, etapy/fazy, aktualizacja postępu w planie, commit WIP.'
argument-hint: 'ścieżka do pliku planu LUB nazwa zmiany/widoku do zaplanowania'
---

# Implementacja frontendu etapami

Prowadzi zmianę UI od planu do wdrożenia małymi etapami. Po każdym etapie zatrzymuje się na bramce, na której decyduje człowiek.

## Wejście

- Ścieżka do istniejącego planu zmiany, albo
- nazwa zmiany lub widoku do zaplanowania (wtedy zacznij od Fazy A i zapisz plan według [szablonu](./references/plan-template.md)).

## Zasady nadrzędne

- Nie zgaduj i nie zakładaj. Brak informacji lub niejasność → zapytaj przez `vscode_askQuestions` i **zatrzymaj się**.
- Trzymaj się zakresu etapu. Nie zmieniaj backendu (server actions, `lib/`, baza), jeśli nie należy do etapu. Brakujący kontrakt backendu zgłoś jako pytanie, nie dopisuj go po cichu.
- Respektuj ścieżki poza zakresem z AGENTS.md: nie czytaj ich, nie edytuj, nie uruchamiaj skryptów z tych katalogów, także pośrednio przez komendy npm. Gdy potrzebna komenda je woła, poszukaj alternatywy z AGENTS.md/README albo zapytaj.
- Jeśli narzędzie edycji jest wyłączone, nie obchodź tego terminalem. Powiedz o tym i podaj gotową treść do wklejenia.
- Weryfikacja w przeglądarce (zrzut ekranu, klikanie) **tylko na prośbę użytkownika**. Domyślnie weryfikacja to komendy (`typecheck`, `lint`, testy) i opis kroku ręcznego dla człowieka.
- Bramki `[STOP]` są obowiązkowe: nie przechodź dalej bez odpowiedzi użytkownika.

## Faza A. Plan (bez edycji kodu)

1. Wczytaj plan lub zbierz kontekst z kodu (read-only): istniejące komponenty, strony, `store/`, `hooks/`, `components/ui/`. Sprawdź [checklistę planu](./references/plan-template.md); braki i niejasności zgłoś pytaniami. `[STOP]` do odpowiedzi.
2. Określ **rodzaj**: refaktor (bez zmiany wyglądu i zachowania) / zmiana UI lub zachowania / nowy widok lub komponent. Od niego zależą testy (patrz [reguły testów](./references/testing-rules.md)).
3. Określ **zakres**: które strony/komponenty, czy potrzebny nowy stan klienta, czy zmiana wymaga zmiany backendu (wtedy poza zakresem lub osobny plan). Wskaż, czy dotyczy ścieżki zakupowej (E2E).
4. Podziel pracę na **etapy** (małe, niezależnie weryfikowalne, każdy z jedną bramką). Zaznacz zależności i kolejność (np. logika → komponent → strona).
5. Wypisz **ryzyka i pytania otwarte** (brak designu, treści, stanów błędu, zachowania mobilnego). Każde wymagające decyzji zadaj przez `vscode_askQuestions` i zapisz jako decyzję.
6. Dla każdego etapu opisz **weryfikację**: komenda + oczekiwany wynik + krok ręczny w przeglądarce (adres, kroki, co powinien zobaczyć człowiek).
7. Zdecyduj **plan testów** (unit na wyciągniętą logikę / E2E) według [reguł testów](./references/testing-rules.md).
8. Zaplanuj **aktualizację dokumentacji** (które pliki, w którym etapie).
9. Zapisz/zaktualizuj plik planu i pokaż go użytkownikowi. `[STOP]` do zatwierdzenia planu.

## Faza B. Pętla implementacji (powtarzaj dla każdego etapu)

1. Zapytaj, czy zacząć kolejny etap, i wskaż który. `[STOP]`.
2. Zaimplementuj **jedną małą zmianę** zgodnie z [regułami implementacji](./references/implementation-rules.md).
3. Pokaż, co się zmieniło (pliki, krótki opis, co człowiek ma obejrzeć w UI). `[STOP]`: użytkownik weryfikuje, wnosi korekty lub zatwierdza. Korekty wprowadź i wróć do tego punktu.
4. Uruchom weryfikację etapu (komendy z planu). Zgłoś wyniki bez upiększeń: co przeszło, czego nie uruchomiono (w tym: nie sprawdzano w przeglądarce, jeśli użytkownik o to nie prosił). `[STOP]`: korekty lub zatwierdzenie.
5. Zaproponuj **plan testów dla etapu** według [reguł testów](./references/testing-rules.md). `[STOP]` do zatwierdzenia, potem napisz testy i uruchom je.
6. Zaktualizuj sekcję **Postęp** w pliku planu (format w [szablonie](./references/plan-template.md)).
7. Zrób **commit WIP** dla etapu (kod, testy i zaktualizowany plik planu) według [szablonów commitów](./references/commit-messages.md).
8. Wróć do kroku 1 z kolejnym etapem, aż do końca planu lub przerwania przez użytkownika.

## Faza C. Zakończenie

1. Zaktualizuj w pliku planu końcowy stan: co zrobione, co nie, co nie zostało zweryfikowane (w tym wizualnie).
2. Zaproponuj kolejne kroki i wypisz pytania otwarte (np. backend, dodatkowe E2E, dokumentacja, zamknięcie commitów WIP).

## References (ładuj warunkowo)

| Plik | Kiedy |
|------|-------|
| [plan-template.md](./references/plan-template.md) | Faza A (tworzenie/przegląd planu) i aktualizacja Postępu |
| [implementation-rules.md](./references/implementation-rules.md) | Faza B krok 2 (przed edycją kodu) |
| [testing-rules.md](./references/testing-rules.md) | Faza A krok 7 i Faza B krok 5 |
| [commit-messages.md](./references/commit-messages.md) | Faza B krok 7 |
