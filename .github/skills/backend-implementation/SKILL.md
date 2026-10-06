---
name: backend-implementation
description: 'Planuje i wdraża zmianę backendu etapami z bramkami weryfikacji przez człowieka: refaktor, zmiana funkcjonalności lub nowa funkcja. Use when: plan zmiany, implementacja backendu, etapy/fazy, wdrożenie krok po kroku, server actions, logika biznesowa, baza danych, integracje (email, płatności), plan testów, aktualizacja postępu w planie, commit WIP.'
argument-hint: 'ścieżka do pliku planu LUB nazwa zmiany/funkcji do zaplanowania'
---

# Implementacja backendu etapami

Prowadzi zmianę od planu do wdrożenia małymi etapami. Po każdym etapie zatrzymuje się na bramce, na której decyduje człowiek.

## Wejście

- Ścieżka do istniejącego planu zmiany, albo
- nazwa zmiany lub funkcji, którą trzeba najpierw zaplanować (wtedy zacznij od Fazy A i zapisz plan według [szablonu](./references/plan-template.md)).

## Zasady nadrzędne

- Nie zgaduj i nie zakładaj. Brak informacji lub niejasność → zapytaj przez `vscode_askQuestions` i **zatrzymaj się**.
- Trzymaj się zakresu etapu. Nie przechodź do frontendu, E2E ani dokumentacji, jeśli nie należą do bieżącego etapu.
- Respektuj ścieżki poza zakresem z AGENTS.md: nie czytaj ich, nie edytuj, nie uruchamiaj skryptów z tych katalogów, także pośrednio przez komendy npm. Gdy potrzebna komenda je woła, poszukaj alternatywy z AGENTS.md/README albo zapytaj.
- Jeśli narzędzie edycji jest wyłączone, nie obchodź tego terminalem. Powiedz o tym i podaj gotową treść do wklejenia.
- Bramki `[STOP]` są obowiązkowe: nie przechodź dalej bez odpowiedzi użytkownika.

## Faza A. Plan (bez edycji kodu)

1. Wczytaj plan lub zbierz kontekst z kodu (read-only). Sprawdź [checklistę planu](./references/plan-template.md); braki i niejasności zgłoś pytaniami. `[STOP]` do odpowiedzi.
2. Określ **rodzaj**: refaktor (bez zmiany zachowania) / zmiana funkcjonalności / nowa funkcja. Od niego zależą testy (patrz [reguły testów](./references/testing-rules.md)).
3. Określ **zakres i integracje**: moduł/obszar, czy dotyczy frontendu, bazy danych, usług zewnętrznych (email, płatności). Elementy poza backendem zapisz jako „poza zakresem”.
4. Podziel pracę na **etapy** (małe, niezależnie weryfikowalne, każdy z jedną bramką dla człowieka). Zaznacz zależności i kolejność.
5. Wypisz **ryzyka i pytania otwarte**, których plan jeszcze nie zawiera. Każde, które wymaga decyzji, zadaj przez `vscode_askQuestions` i zapisz jako decyzję.
6. Dla każdego etapu opisz **weryfikację**: jak człowiek sprawdzi, że działa (komenda, oczekiwany wynik, ewentualnie ręczny krok).
7. Zdecyduj **plan testów** (unit / integracja / E2E, co wchodzi w zakres i dlaczego) według [reguł testów](./references/testing-rules.md).
8. Zaplanuj **aktualizację dokumentacji** (które pliki, w którym etapie).
9. Zapisz/zaktualizuj plik planu i pokaż go użytkownikowi. `[STOP]` do zatwierdzenia planu.

## Faza B. Pętla implementacji (powtarzaj dla każdego etapu)

1. Zapytaj, czy zacząć kolejny etap, i wskaż który. `[STOP]`.
2. Zaimplementuj **jedną małą zmianę** zgodnie z [regułami implementacji](./references/implementation-rules.md).
3. Pokaż, co się zmieniło (pliki, krótki opis). `[STOP]`: użytkownik weryfikuje, wnosi korekty lub zatwierdza. Korekty wprowadź i wróć do tego punktu.
4. Uruchom weryfikację etapu (komendy z planu). Zgłoś wyniki bez upiększeń: co przeszło, czego nie uruchomiono. `[STOP]`: korekty lub zatwierdzenie.
5. Zaproponuj **plan testów dla etapu** według [reguł testów](./references/testing-rules.md). `[STOP]` do zatwierdzenia, potem napisz testy i uruchom je.
6. Zaktualizuj sekcję **Postęp** w pliku planu (format w [szablonie](./references/plan-template.md)).
7. Zrób **commit WIP** dla etapu (kod, testy i zaktualizowany plik planu) według [szablonów commitów](./references/commit-messages.md).
8. Wróć do kroku 1 z kolejnym etapem, aż do końca planu lub przerwania przez użytkownika.

## Faza C. Zakończenie

1. Zaktualizuj w pliku planu końcowy stan: co zrobione, co nie, co nie zostało zweryfikowane.
2. Zaproponuj kolejne kroki i wypisz pytania otwarte (np. frontend, E2E, dokumentacja, zamknięcie commitów WIP).

## References (ładuj warunkowo)

| Plik | Kiedy |
|------|-------|
| [plan-template.md](./references/plan-template.md) | Faza A (tworzenie/przegląd planu) i aktualizacja Postępu |
| [implementation-rules.md](./references/implementation-rules.md) | Faza B krok 2 (przed edycją kodu) |
| [testing-rules.md](./references/testing-rules.md) | Faza A krok 7 i Faza B krok 5 |
| [commit-messages.md](./references/commit-messages.md) | Faza B krok 7 |
