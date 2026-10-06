# Szablon planu i checklista

## Checklista planu wejściowego

Plan jest gotowy do implementacji, gdy zawiera:

- [ ] Cel i rodzaj zmiany (refaktor / zmiana funkcjonalności / nowa funkcja)
- [ ] Decyzje zatwierdzone przez użytkownika (z liczbami: progi, kwoty, limity)
- [ ] Zakres: moduły/pliki, baza danych, usługi zewnętrzne, frontend (tak/nie)
- [ ] Etapy z zależnościami (co blokuje co, co może iść równolegle)
- [ ] Dla każdego etapu: bramka weryfikacji dla człowieka (komenda + oczekiwany wynik)
- [ ] Plan testów: unit / integracja / E2E z uzasadnieniem zakresu
- [ ] Plan aktualizacji dokumentacji (pliki + etap)
- [ ] Poza zakresem (jawna lista)
- [ ] Ryzyka i pytania otwarte (każde z propozycją decyzji)

Brak któregokolwiek punktu = pytanie do użytkownika, nie założenie.

## Szablon pliku planu

```markdown
# Plan: {nazwa zmiany}

## Rodzaj i cel
{refaktor | zmiana funkcjonalności | nowa funkcja} — {jedno zdanie, po co}

## Decyzje (zatwierdzone)
- {decyzja}

## Zakres
- Backend: {moduły/pliki}
- Baza danych: {tak/nie, co}
- Usługi zewnętrzne: {email/płatności/brak}
- Frontend: {w zakresie / poza zakresem}

## Etapy
1. **{Etap}** — {co} (*zależy od: …*)
   - Weryfikacja: {komenda → oczekiwany wynik; ewentualny krok ręczny}

## Plan testów
- Unit: {co}
- Integracja: {co}
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

- [x] **1. {Etap}** — {co faktycznie zrobiono; kluczowe symbole/pliki}. Commit `{hash}` (WIP).
- [~] **2. {Etap}** — {co zrobione, co zostało}.
  - [x] {podzadanie, np. testy unit — wynik}
  - [ ] {podzadanie}
- [ ] **3. {Etap}** — nierozpoczęty.

**Weryfikacja:** {co przeszło}. Nie uruchamiano: {lista}.

**Uwaga:** {znane skutki uboczne lub ograniczenia stanu pośredniego}.
```

Zasady Postępu:
- Pisz tylko to, co zweryfikowane. Niesprawdzone → „Nie uruchamiano”.
- Podawaj hash commitu i liczby testów z faktycznego uruchomienia.
- Gdy implementacja odeszła od planu, zapisz odstępstwo i powód.
