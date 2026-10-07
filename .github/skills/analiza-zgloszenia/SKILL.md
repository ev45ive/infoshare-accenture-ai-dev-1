---
name: analiza-zgloszenia
description: 'Interaktywnie doprecyzowuje zgłoszenie (ticket, email, opis błędu, prośba o zmianę) i przygotowuje podsumowanie do wklejenia w email do nadawcy. Dwa tryby: lista pytań do nadawcy albo tryb spotkania (AI dopytuje użytkownika). Use when: analiza zgłoszenia, doprecyzowanie zgłoszenia, niejasny ticket, brakujące informacje, pytania do zgłaszającego, clarify ticket, grill me, refinement, odpowiedź mailowa do nadawcy.'
argument-hint: 'treść zgłoszenia lub załączony plik zgłoszenia'
---

# Analiza zgłoszenia

Cel: ustalić z użytkownikiem, czego naprawdę dotyczy zgłoszenie, i zapisać to w formie podsumowania do wklejenia w email. Skill niczego nie implementuje.

## Wejście

- Zgłoszenie (ticket, email, wiadomość) wklejone w czacie lub dołączone ręcznie jako plik.
- Brak zgłoszenia → poproś o nie i **zatrzymaj się**.

## Zasady nadrzędne

- Nie zgaduj i nie zakładaj. Każda niejasność to pytanie, nie domysł. Oddzielaj fakty ze zgłoszenia od własnych interpretacji.
- Respektuj ścieżki poza zakresem z AGENTS.md (np. `zgloszenia/`, `notatki/`): nie czytaj ich samodzielnie. Treść z takich katalogów analizuj tylko, gdy użytkownik dołączył ją bezpośrednio.
- Kontekst projektu (kod, `docs/product-contract.md`) czytaj tylko wtedy, gdy pomaga sformułować pytanie lub oddzielić zakres od tego, co poza nim. Nie odpowiadaj na pytania za nadawcę na podstawie kodu.
- Pytania zadawaj przez `vscode_askQuestions`. Bramki `[STOP]` są obowiązkowe.
- Nie proponuj rozwiązania technicznego ani estymat. To nie jest etap planowania.

## Procedura

### 1. Zrozum zgłoszenie

1. Wypisz w 3-5 punktach, co z treści wynika **wprost** (kto, co, gdzie, kiedy, oczekiwany efekt).
2. Zaznacz luki i niespójności, korzystając z [checklisty pytań](./references/question-checklist.md).
3. Pokaż to użytkownikowi.

### 2. Wybierz tryb

Zapytaj przez `vscode_askQuestions` (opcje, bez wolnego tekstu): `[STOP]`

| Tryb | Dla kogo |
|------|----------|
| **A. Lista pytań do nadawcy** | Użytkownik nie zna odpowiedzi i chce je wysłać nadawcy zgłoszenia |
| **B. Tryb spotkania** | Użytkownik zna kontekst lub odpowie za nadawcę, AI dopytuje krytycznie |

### 3A. Tryb: lista pytań do nadawcy

1. Przygotuj listę pytań pogrupowaną według [checklisty](./references/question-checklist.md). Każde pytanie krótkie, jednoznaczne, odpowiadalne bez znajomości projektu. Pomiń to, o co nie wolno pytać.
2. Pokaż listę i zapytaj przez `vscode_askQuestions`, czy zmienić, usunąć lub dodać pytania. `[STOP]`
3. Wprowadź poprawki i powtarzaj, aż użytkownik zatwierdzi listę.
4. Przejdź do kroku 4 (podsumowanie). Odpowiedzi nadawcy jeszcze nie ma, więc pytania trafiają do szablonu jako „Pytania otwarte”.

### 3B. Tryb: spotkanie (grill)

1. Zaproponuj pierwszą partię pytań (maks. 3-5, najważniejsze luki najpierw) przez `vscode_askQuestions`. Użytkownik odpowiada, pomija lub dodaje własne pytania. `[STOP]`
2. Po każdej partii:
   - zapisz odpowiedzi jako ustalenia,
   - sprawdź je krytycznie: sprzeczności ze zgłoszeniem, odpowiedzi ogólnikowe, nowe luki wynikające z odpowiedzi,
   - zadaj kolejną partię tylko o to, co nadal niejasne.
3. Kończ, gdy: (a) wszystkie kategorie z checklisty są wyjaśnione lub świadomie oznaczone „poza zakresem / nieznane”, albo (b) użytkownik powie **stop**.
4. Przed zakończeniem pokaż stan: ustalone / nadal niejasne. Pozycje niejasne trafiają do „Pytań otwarte”.
5. Przejdź do kroku 4.

### 4. Podsumowanie do emaila

1. Wypełnij [szablon podsumowania](./references/summary-template.md). Nie pomijaj sekcji; pustą oznacz „brak”.
2. Pokaż gotowy tekst w jednym bloku do skopiowania. Nie zapisuj pliku, chyba że użytkownik o to poprosi.
3. Zapytaj przez `vscode_askQuestions`, czy poprawić ton, długość lub treść. `[STOP]`. Wprowadź korekty.

## Kryteria ukończenia

- Każda sekcja szablonu jest wypełniona lub jawnie oznaczona jako brak.
- Rozróżniono fakty ze zgłoszenia, odpowiedzi i otwarte pytania.
- Zakres i „poza zakresem” są wprost nazwane.
- Brak rozwiązania technicznego i estymat w treści emaila.

## References (ładuj warunkowo)

| Plik | Kiedy |
|------|-------|
| [question-checklist.md](./references/question-checklist.md) | Krok 1 oraz tworzenie pytań w 3A/3B |
| [summary-template.md](./references/summary-template.md) | Krok 4 |
