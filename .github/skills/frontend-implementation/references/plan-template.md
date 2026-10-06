# Szablon planu i checklista

## Checklista planu wejściowego

Plan jest gotowy do implementacji, gdy zawiera:

- [ ] Cel i rodzaj zmiany (refaktor / zmiana UI lub zachowania / nowy widok)
- [ ] Decyzje zatwierdzone przez użytkownika (treści, układ, zachowanie, progi i kwoty widoczne w UI)
- [ ] Zakres: strony (`app/`), komponenty, stan klienta (`store/`, `hooks/`), backend (tak/nie)
- [ ] Stany UI: ładowanie, pusty, błąd, sukces (dla każdego widoku/komponentu w zakresie)
- [ ] Zachowanie dla gościa i zalogowanego, jeśli widok tego dotyczy
- [ ] Etapy z zależnościami (co blokuje co, co może iść równolegle)
- [ ] Dla każdego etapu: bramka weryfikacji (komenda + oczekiwany wynik + krok ręczny w przeglądarce)
- [ ] Plan testów: unit (wyciągnięta logika) / E2E z uzasadnieniem zakresu
- [ ] Plan aktualizacji dokumentacji (pliki + etap)
- [ ] Poza zakresem (jawna lista)
- [ ] Ryzyka i pytania otwarte (każde z propozycją decyzji)

Brak któregokolwiek punktu = pytanie do użytkownika, nie założenie.

## Szablon pliku planu

```markdown
# Plan: {nazwa zmiany}

## Rodzaj i cel
{refaktor | zmiana UI/zachowania | nowy widok} — {jedno zdanie, po co}

## Decyzje (zatwierdzone)
- {decyzja}

## Zakres
- Strony/komponenty: {pliki}
- Stan klienta: {store/hooks: tak/nie, co}
- Backend: {w zakresie / poza zakresem + wymagany kontrakt}
- Stany UI: {loading / empty / error / sukces — gdzie}

## Etapy
1. **{Etap}** — {co} (*zależy od: …*)
   - Weryfikacja: {komenda → oczekiwany wynik}
   - Ręcznie: {adres → kroki → co widać}

## Plan testów
- Unit: {co}
- E2E: {w zakresie / poza zakresem + powód}

## Dokumentacja
- {plik} — {co zaktualizować} (etap {n})

## Poza zakresem
{lista}

## Ryzyka i pytania otwarte
- {ryzyko/pytanie} → {decyzja lub „do ustalenia”}
```

## Szablon sekcji Postęp

Dodaj lub aktualizuj w pliku planu po każdym etapie. Znaczniki: `[x]` zrobione, `[~]` w toku/częściowo, `[ ]` nierozpoczęte.

```markdown
## Postęp (stan na {RRRR-MM-DD})

- [x] **1. {Etap}** — {co faktycznie zrobiono; kluczowe komponenty/pliki}. Commit `{hash}` (WIP).
- [~] **2. {Etap}** — {co zrobione, co zostało}.
  - [x] {podzadanie, np. testy unit — wynik}
  - [ ] {podzadanie}
- [ ] **3. {Etap}** — nierozpoczęty.

**Weryfikacja:** {co przeszło}. Nie uruchamiano: {lista}. Nie sprawdzano w przeglądarce: {tak/nie}.

**Uwaga:** {znane skutki uboczne lub ograniczenia stanu pośredniego}.
```

Zasady Postępu:
- Pisz tylko to, co zweryfikowane. Niesprawdzone → „Nie uruchamiano”.
- Podawaj hash commitu i liczby testów z faktycznego uruchomienia.
- Gdy implementacja odeszła od planu, zapisz odstępstwo i powód.
