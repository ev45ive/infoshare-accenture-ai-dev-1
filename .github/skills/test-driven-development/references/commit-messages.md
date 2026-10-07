# Commity w cyklu RGR

Język: polski, zgodnie z historią repozytorium. Pierwsza linia do ok. 72 znaków, bez kropki na końcu.

## Szablony

- Po GREEN: `WIP: {funkcja} - pinezka: {zachowanie}`
- Po REFACTOR: `WIP: {funkcja} - refaktor: {co}`
- Po zamknięciu całości: `{Czasownik w trybie rozkazującym} {co} {gdzie}`

Przykłady:
- `WIP: darmowy kurier - pinezka: dostawa gratis od progu`
- `WIP: darmowy kurier - refaktor: wyodrębnienie calculateDelivery`

## Reguły

- [ ] Commit tylko w zielonym stanie (pełna definicja zielonego przeszła tuż przed commitem).
- [ ] Dodawaj pliki jawnie po nazwie (`git add plik1 plik2`). Nigdy `git add .` ani `-A`.
- [ ] Przed commitem uruchom `git status --short` i sprawdź listę.
- [ ] Nie dodawaj cudzych zmian: pliki niezwiązane z krokiem zostaw poza commitem i wymień w podsumowaniu.
- [ ] Plik TODO wchodzi do commitu razem ze zmianą, której dotyczy.
- [ ] Nie używaj `--no-verify`, `--amend` na opublikowanych commitach ani force push.
- [ ] Nie pushuj bez wyraźnej prośby.
- [ ] Refaktor w osobnym commicie niż GREEN, żeby diff pokazywał brak zmiany zachowania.
