---
name: test-driven-development
description: 'Prowadzi zmianę w cyklu TDD Red-Green-Refactor z listą TODO i pinezkami (testami zabezpieczającymi zachowanie): doprecyzowanie, plan TODO, minimalna pinezka, refaktor bez ruszania pinezek i TODO, bramki zatwierdzeń, pytanie o commit, pilnowanie zielonego stanu. Use when: TDD, red green refactor, RGR, test first, lista TODO, pinezka, save game, testy charakteryzujące, mała zmiana krok po kroku, refaktor pod ochroną testów.'
argument-hint: 'opis zachowania/zmiany LUB ścieżka do pliku TODO (docs/tdd-todo-*.md)'
---

# TDD Red-Green-Refactor: TODO + pinezki

Prowadzi użytkownika przez cykl małymi krokami. Użytkownik decyduje na bramkach `[STOP]`, a skill pilnuje, żeby stan repozytorium po każdym kroku był zielony.

## Słownik

| Pojęcie | Znaczenie |
|---|---|
| **TODO** | Uporządkowana lista przyszłych zachowań (plan). To jest **RED**. |
| **Pinezka** | Minimalny test, który przypina zachowanie, którego nie wolno zmienić ("save game"). To jest **GREEN**. |
| **Zielony stan** | Wszystkie komendy z sekcji "Definicja zielonego" przechodzą. |

## Zasady nadrzędne

- Nie zgaduj i nie zakładaj. Niejasność → zapytaj przez `vscode_askQuestions` i **zatrzymaj się**.
- Pracuj na **jednym punkcie TODO naraz**.
- **Grupowanie:** na bramce RED możesz zaproponować kilka blisko powiązanych punktów TODO (np. warianty tej samej funkcji) w jednej turze RGR. Użytkownik zatwierdza grupę na `[STOP]`. Każdy punkt ma własny test; RED, GREEN i REFACTOR przechodzą całą grupę, a zielony zestaw i pytanie o commit dotyczą grupy.
- **RED** zmienia tylko TODO (i test bieżącego punktu). Nie dotyka kodu produkcyjnego.
- **GREEN** to minimum kodu, które spina pinezkę. Nowa potrzeba odkryta w trakcie **nie jest implementowana**: dopisz ją do TODO i wróć do bieżącego punktu.
- **REFACTOR** zmienia tylko to, co nie jest pinezką ani TODO. Gdy trzeba ruszyć pinezkę lub TODO, to nie jest refaktor: wróć do RED.
- **Sprzeczność:** nowe założenie (RED→GREEN) psujące wcześniejszy punkt TODO lub pinezkę wymaga poprawienia **obu** (TODO i pinezki), zanim pójdziesz dalej. Pokaż sprzeczność użytkownikowi, `[STOP]`.
- Poza fazą RED nigdy nie zostawiaj repozytorium w czerwonym stanie. Pada coś, czego nie spodziewałeś się, więc zatrzymaj się i zgłoś, nie "naprawiaj" osłabianiem testów.
- Nie osłabiaj, nie usuwaj i nie pomijaj (`skip`, `only`, rozluźnione asercje) pinezek, żeby przeszły.
- Respektuj ścieżki poza zakresem z AGENTS.md: nie czytaj, nie edytuj i nie uruchamiaj skryptów stamtąd, także pośrednio przez komendy npm.
- Jeśli narzędzie edycji jest wyłączone, nie obchodź tego terminalem. Podaj gotową treść do wklejenia.
- Bramki `[STOP]` są obowiązkowe.

## Definicja zielonego

Ustal z użytkownikiem raz, w kroku 0, i zapisz w pliku TODO. Domyślnie dla tego repo:

- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run test:integration` tylko gdy zmiana dotyka server actions lub bazy (przed edycją `tests/integration/*.test.ts` przeczytaj `.github/instructions/integration-tests.instructions.md`)

Wynik raportuj bez upiększeń: co przeszło, co padło, czego nie uruchomiono.

## Bramka 0. Tryb pracy: TDD czy klasycznie?

Pierwsza decyzja, przed czymkolwiek innym. Pomiń ją tylko wtedy, gdy tryb został już wybrany w tej rozmowie (np. przez agenta Backend/Frontend Developer).

1. Zbierz minimum kontekstu z kodu (read-only) i oceń zadanie:
   - **Sprzyja TDD:** czysta logika i reguły biznesowe, obliczenia, walidacje, server actions z jasnym kontraktem, refaktor kodu, który da się przypiąć testami, naprawa błędu możliwa do odtworzenia testem.
   - **Sprzyja klasycznie:** eksploracja lub prototyp o niejasnym kształcie, zmiany czysto wizualne (układ, style, tekst), konfiguracja i skrypty, jednorazowe migracje, zadania bez sensownego sposobu automatycznej weryfikacji.
2. Przedstaw **propozycję** (TDD lub klasycznie) z krótkim uzasadnieniem opartym na powyższych kryteriach i konkretach zadania.
3. Zapytaj przez `vscode_askQuestions` z opcjami: TDD (RGR z TODO i pinezkami) / klasycznie (implementacja, potem testy) / inaczej. Zaznacz rekomendację. `[STOP]`.
4. Decyzja:
   - **TDD** → przejdź do kroku 0.
   - **Klasycznie** → zakończ ten skill, nie twórz pliku TODO. Wróć do procesu, z którego przyszedłeś (skill `backend-implementation` / `frontend-implementation`), a bez niego poprowadź zadanie zwykłym trybem.

## Krok 0. Wejście i doprecyzowanie

1. Zbierz kontekst z kodu (read-only). Jeśli podano plik TODO, wczytaj go i przejdź do kroku 2.
2. Sprawdź [checklistę doprecyzowania](./references/clarification-checklist.md). Braki zgłoś pytaniami przez `vscode_askQuestions`. `[STOP]`.
3. Ustal **rodzaj**: nowa funkcja / zmiana zachowania / refaktor istniejącego kodu.
   - Refaktor lub zmiana istniejącego kodu bez testów: **najpierw pinezki charakteryzujące** obecne zachowanie (save game), dopiero potem zmiany.
4. Ustal poziom testów (unit / integracja / e2e) i potwierdź definicję zielonego.
5. Zaproponuj, gdzie zapisać TODO (domyślnie `docs/tdd-todo-{nazwa}.md`, format w [szablonie](./references/todo-template.md)). `[STOP]`.
6. Sprawdź stan wyjściowy: uruchom zielone komendy. Jeśli repo jest już czerwone, zgłoś to i zapytaj, jak postąpić (naprawa osobno, lub świadome przejście dalej). Nie zaczynaj cyklu na nieznanym czerwonym.

## Faza RED. Plan (TODO)

1. Zaproponuj listę TODO: małe zachowania, w kolejności od najprostszego (przypadek podstawowy → warianty → brzegi → błędy). Każdy punkt to jedno zdanie opisujące obserwowalne zachowanie.
2. Do każdego punktu dopisz sugestię: poziom testu i ewentualne ryzyko.
3. Pokaż TODO i wskaż **następny punkt**. `[STOP]`: użytkownik zatwierdza, zmienia kolejność lub dopisuje punkty.
4. Napisz test dla następnego punktu i uruchom go. Upewnij się, że **pada z właściwego powodu** (brak zachowania, a nie błąd importu czy konfiguracji). Test przechodzący od razu: zgłoś i zapytaj (zachowanie już istnieje, więc to pinezka, albo test jest zły).
5. Pokaż wynik czerwonego testu. `[STOP]` do zatwierdzenia przejścia do GREEN.

## Faza GREEN. Pinezka

1. Napisz **minimum** kodu produkcyjnego, które spina test. Naiwne i zahardkodowane rozwiązanie jest dozwolone.
2. Nowe potrzeby, edge case'y i "przy okazji" nie są implementowane: dopisz je do TODO jako nowe punkty (z adnotacją, skąd się wzięły).
3. Uruchom **cały zielony zestaw**, nie tylko nowy test. Gdy coś pada, napraw kod, nie test. Gdy test ma błąd, pokaż to użytkownikowi i `[STOP]`.
4. Sprawdź sprzeczności z wcześniejszymi punktami TODO i pinezkami. Są → procedura sprzeczności (patrz zasady).
5. Oznacz punkt w TODO jako zrobiony i pokaż: zmienione pliki, nowe punkty TODO, wynik zielonego. `[STOP]`.
6. **Pytanie o commit** (patrz niżej).

## Faza REFACTOR

1. Zaproponuj konkretne refaktory (duplikacja, nazwy, wyodrębnienie funkcji, uproszczenie warunków) albo stwierdź, że nie ma czego poprawiać. `[STOP]`: użytkownik wybiera, które.
2. Wykonuj po jednej drobnej zmianie i po każdej uruchamiaj zielony zestaw. Pada → cofnij tę zmianę.
3. Dozwolone jest refaktoryzowanie testów (czytelność, setup) tylko wtedy, gdy nie zmienia to ich znaczenia. Zawsze zgłoś to użytkownikowi.
4. Nie zmieniaj pinezek ani TODO. Potrzeba taka zmiana → zatrzymaj refaktor i wróć do RED.
5. Pokaż diff w skrócie i wynik zielonego. `[STOP]`.
6. **Pytanie o commit**.

## Pytanie o commit

Po każdym zielonym stanie (po GREEN i po REFACTOR) zapytaj przez `vscode_askQuestions`: zacommitować teraz / połączyć z następnym krokiem / pominąć. Rekomenduj commit.

- Format i reguły: [commit-messages.md](./references/commit-messages.md).
- Commit tylko w zielonym stanie. Czerwony stan (koniec RED) nie jest commitowany, chyba że użytkownik wprost o to poprosi.
- Plik TODO wchodzi do commitu razem ze zmianą, której dotyczy.

## Pętla

Po commicie lub decyzji o jego pominięciu: pokaż aktualny TODO i zaproponuj następny punkt (RED). `[STOP]`. Powtarzaj do pustego TODO lub przerwania przez użytkownika.

## Zakończenie

1. Uruchom pełny zielony zestaw jeszcze raz i podaj wynik.
2. Podsumuj: zrobione punkty, pozostałe w TODO, pinezki dodane w cyklu, rzeczy niezweryfikowane.
3. Zapytaj o kolejne kroki (np. e2e, dokumentacja, squash commitów).

## References (ładuj warunkowo)

| Plik | Kiedy |
|------|-------|
| [clarification-checklist.md](./references/clarification-checklist.md) | Krok 0 |
| [todo-template.md](./references/todo-template.md) | Tworzenie i aktualizacja TODO |
| [commit-messages.md](./references/commit-messages.md) | Pytanie o commit |
