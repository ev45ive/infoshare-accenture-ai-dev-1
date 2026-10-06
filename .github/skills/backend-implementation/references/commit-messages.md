# Szablony commitów

Język: polski, zgodnie z historią repozytorium. Pierwsza linia do ok. 72 znaków, bez kropki na końcu.

## Commit WIP (koniec etapu)

```
WIP: {funkcja} - {obszar etapu}
```

Przykłady:
- `WIP: darmowy kurier DHL od 300 zł - backend (placeOrder, calculateOrderTotals)`
- `WIP: testy darmowego kuriera - unit i integracja (placeOrder)`

Etap implementacji i jego testy mogą być jednym lub dwoma commitami WIP, zależnie od decyzji użytkownika.

## Commit końcowy (po zatwierdzeniu etapu lub całości)

```
{Czasownik w trybie rozkazującym} {co} {opcjonalnie: gdzie}
```

Przykład: `Dodaj skrypt test:integration:direct i opis w dokumentacji`

Zmiany narzędziowe i dokumentacyjne (skrypty, README, AGENTS.md) idą w osobnym commicie, **bez** prefiksu WIP.

## Reguły

- [ ] Dodawaj pliki jawnie po nazwie (`git add plik1 plik2`). Nigdy `git add .` ani `-A`.
- [ ] Nie dodawaj cudzych zmian: pliki zmodyfikowane przez użytkownika lub narzędzia, a niezwiązane z etapem, zostaw poza commitem i wymień w podsumowaniu.
- [ ] Przed commitem uruchom `git status --short` i sprawdź listę.
- [ ] Nie używaj `--no-verify`, `--amend` na opublikowanych commitach ani force push.
- [ ] Nie pushuj bez wyraźnej prośby.
- [ ] Plik planu z zaktualizowanym Postępem wchodzi do commitu WIP tego etapu. Hash tego commitu nie jest jeszcze znany, więc wpisz go w Postępie przy następnym etapie (do jego commitu).
