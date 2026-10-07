---
name: przygotuj-pull-request
description: 'Przygotowuje Pull Request etapami z bramkami zatwierdzeń: spójna lista zmian, nazwa PR i brancha, utworzenie/sprawdzenie brancha, wybór commitów (WIP czy gotowe) do squasha, weryfikacja testów i dokumentacji, wpis w CHANGELOG, squash na branchu, pytanie o push. Use when: przygotuj PR, prepare pull request, pull request, nazwa brancha, squash commitów, commity WIP, changelog, bramki jakości przed PR, domknięcie zmiany.'
argument-hint: 'opcjonalnie: nazwa zmiany/funkcji lub ścieżka do planu (docs/plan-*.md)'
---

# Przygotowanie Pull Requesta

Prowadzi od roboczych commitów do jednego, opisanego commita gotowego pod PR. Po każdym kroku zatrzymuje się na bramce `[STOP]`, na której decyduje człowiek. Konwencje bierze z [CONTRIBUTING.md](../../../CONTRIBUTING.md).

## Zasady nadrzędne

- Nie zgaduj i nie zakładaj. Brak informacji → zapytaj przez `vscode_askQuestions` i **zatrzymaj się**.
- Respektuj ścieżki poza zakresem z AGENTS.md (`docs/ai-sessions/`, `workshop/`, `zgloszenia/`, `notatki/`, `scripts/`, `node_modules/`): nie czytaj ich i nie streszczaj do opisu PR. Zmiany w nich tylko wymień jako nazwy plików z `git status`/`git diff --stat`.
- Operacje git są lokalne i odwracalne. **Push, force push i otwarcie PR tylko po wyraźnej zgodzie** (krok 8).
- Dodawaj pliki jawnie po nazwie. Nigdy `git add .` ani `-A`. Nie używaj `--no-verify`.
- Nie dotykaj cudzych zmian: pliki niezwiązane ze zmianą zostaw poza commitem i wymień w podsumowaniu.
- Nigdy nie squashuj ani nie resetuj gałęzi głównej (`main`).
- Bramki `[STOP]` są obowiązkowe.

## Procedura

### 1. Zbierz spójną listę zmian

1. `git status --short`, `git branch --show-current`, `git merge-base HEAD main` (baza = gałąź główna z CONTRIBUTING; jeśli inna, zapytaj).
2. `git --no-pager log --oneline <baza>..HEAD` oraz `git --no-pager diff --stat <baza>..HEAD`.
3. Jeśli podano plan zmiany, porównaj z nim zakres (co zrobione, czego brak).
4. Pogrupuj zmiany tematycznie: kod, testy, dokumentacja, narzędzia. Oddziel zmiany niezwiązane z jednym tematem PR.
5. Pokaż listę. `[STOP]`: użytkownik potwierdza spójność lub wskazuje, co wyłączyć (osobny PR / poza commitem).

### 2. Ustal nazwę PR i brancha

1. Typ: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
2. Propozycja brancha: `<typ>/<opis-kebab-case>` (np. `feat/limit-ilosci-w-koszyku`). Propozycja tytułu: `<typ>: <krótki opis>`, polski, do ok. 72 znaków, bez kropki.
3. Zadaj `vscode_askQuestions` z propozycjami. `[STOP]` do zatwierdzenia nazw.

### 3. Utwórz lub sprawdź branch

- Jeśli bieżący branch ma już zatwierdzoną nazwę: nic nie rób.
- Jeśli bieżący branch to `main`: `git switch -c <branch>` (commity i niezacommitowane zmiany zostają na nowym branchu). Przed tym pokaż, co zostanie przeniesione.
- Jeśli bieżący branch ma inną nazwę: zapytaj, czy go przemianować (`git branch -m`), czy zostawić. Jeśli już był pushowany, przemianowanie wymaga osobnej decyzji.
- Jeśli branch o zatwierdzonej nazwie istnieje, ale to nie bieżący: zapytaj, czy przełączyć się na niego.
- Niezacommitowane zmiany związane z PR: pokaż i zapytaj, czy je zacommitować (jawne `git add`) przed squashem. `[STOP]`.

### 4. Wybierz commity do squasha

1. Wypisz commity `<baza>..HEAD` z klasyfikacją: **WIP** (prefiks `WIP:`) / **gotowe** (reszta) / **cudze lub niezwiązane** (np. zmiany narzędziowe, MCP, dokumentacja poza tematem).
2. Domyślnie squashuj **tylko WIP**; commity „gotowe" zostają bez zmian. Zapytaj, które WIP-y wchodzą do squasha i czy któryś „gotowy" też. `[STOP]`.
3. `git reset --soft` zbiera tylko **ciągły ogon** historii, więc wybierz tryb:
   - **WIP tworzą ciągły ogon** (ostatnie commity): `reset --soft` do ostatniego commita spoza squasha.
   - **WIP-y są przemieszane z „gotowymi" lub leżą pod nimi**: powiedz, że wymaga to `git rebase -i` wykonywanego ręcznie przez użytkownika, i podaj gotową listę `pick`/`squash` (pierwszy WIP `pick`, kolejne `squash`/`fixup`). Dalej wróć do kroku 7.6.
   - **Wszystko od bazy** (gdy użytkownik wybierze też „gotowe"): `reset --soft <baza>`.

### 5. Sprawdź testy i dokumentację

1. Uruchom bramki jakości z CONTRIBUTING po kolei i raportuj wynik bez upiększeń (co przeszło, co padło, czego nie uruchomiono):
   `npm run typecheck` → `npm run lint` → `npm run test:unit` → `npm run test:integration`.
   `npm run test:e2e` jest wolny: uruchom go tylko na prośbę użytkownika (zapytaj w tym kroku) i oznacz w raporcie jako „nieuruchomiony", jeśli pominięto. Jeśli komenda woła zakazany katalog, poszukaj alternatywy z README/AGENTS.md (np. `test:integration:direct`) albo zapytaj.
2. Sprawdź zgodność z definicją „done" z CONTRIBUTING:
   - zmiana zachowania ma test,
   - nowa reguła biznesowa jest w `docs/contracts/` (i `docs/product-contract.md`, jeśli dotyczy),
   - istotna decyzja architektoniczna ma wpis w `docs/adr/index.md`,
   - zmiana widoczna dla użytkownika ma wpis w `CHANGELOG.md` (krok 6).
3. Braki zgłoś listą. Naprawę wykonuj tylko po zgodzie. Czerwone testy blokują dalsze kroki. `[STOP]`.

### 6. Utwórz wpis w CHANGELOG

1. Przeczytaj `CHANGELOG.md` (format Keep a Changelog, po polsku).
2. Dodaj wpisy w `## [Unreleased]` w podsekcjach `### Added` / `### Changed` / `### Fixed` (istniejące uzupełnij, nie dubluj).
3. Wpis opisuje zmianę **widoczną dla użytkownika**, jednym zdaniem, z linkiem do kontraktu lub dokumentu, jeśli istnieje. Bez hashy commitów i szczegółów implementacji.
4. Pokaż diff. `[STOP]`: korekty lub zatwierdzenie. Plik wejdzie do squasha (krok 7); gdy squash nie obejmuje ostatniego commita, zrób z niego osobny commit `docs: ...` bez prefiksu WIP.

### 7. Squash na branchu

1. Upewnij się, że drzewo robocze zawiera tylko zmiany związane z PR (`git status --short`). Dodaj jawnie pliki (np. `CHANGELOG.md`).
2. Kopia zapasowa (lokalna, odwracalna): `git branch backup/<branch>-przed-squash`.
3. Jeśli commity z zakresu były już na `origin`: ostrzeż, że po squashu push wymaga `--force-with-lease`, i zapytaj o zgodę przed dalszymi krokami. `[STOP]`.
4. Squash (tryb ogona): `git reset --soft <ostatni-commit-spoza-squasha>`, potem `git add` jawnych plików (m.in. CHANGELOG) i **jeden** commit zamiast squashowanych WIP-ów, z tytułem `<typ>: <opis>` zatwierdzonym w kroku 2. Commity „gotowe" przed ogonem pozostają.
5. Treść commita: tytuł + krótki opis (co, dlaczego, jak zweryfikowano), zgodnie z opisem PR z CONTRIBUTING. Nie zostawiaj prefiksu `WIP:`.
6. Zweryfikuj: `git --no-pager log --oneline <baza>..HEAD`, `git status --short`, a następnie porównaj `git diff backup/<branch>-przed-squash HEAD` (powinno być puste).
7. Pokaż wynik. `[STOP]`.

### 8. Zapytaj o push

1. Podsumuj: branch, tytuł, liczba commitów, wyniki testów, wpis w CHANGELOG, pliki pominięte jako niezwiązane, nazwa kopii zapasowej.
2. Przygotuj gotowy opis PR: **co**, **dlaczego**, **jak zweryfikowano** (komendy i wyniki).
3. Zapytaj przez `vscode_askQuestions`, czy wykonać push (`git push -u origin <branch>`; `--force-with-lease` tylko gdy branch był wcześniej pushowany i użytkownik się zgodził). Bez zgody nie pushuj.
4. Po pushu nie otwieraj PR samodzielnie; podaj opis do wklejenia, chyba że użytkownik poprosi inaczej.

## Kryteria ukończenia

- [ ] Lista zmian zatwierdzona, niezwiązane pliki poza commitem
- [ ] Nazwa brancha i tytuł PR zatwierdzone, branch istnieje i jest bieżący
- [ ] Bramki jakości zielone (lub jawnie zgłoszone braki)
- [ ] Dokumentacja i CHANGELOG zaktualizowane
- [ ] Brak commitów `WIP:` na branchu; „gotowe" commity zachowane; diff względem kopii zapasowej pusty
- [ ] Decyzja o pushu podjęta przez użytkownika
