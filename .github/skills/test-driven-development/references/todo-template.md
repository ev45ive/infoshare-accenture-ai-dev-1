# Szablon pliku TODO

Domyślna ścieżka: `docs/tdd-todo-{nazwa}.md`.

```markdown
# TDD TODO: {nazwa zmiany}

## Cel
{jedno zdanie, zachowanie obserwowalne z zewnątrz}

## Rodzaj
{nowa funkcja | zmiana zachowania | refaktor}

## Definicja zielonego
- {komenda}
- {komenda}

## Poza zakresem
- {co świadomie pomijamy}

## TODO (RED)
Kolejność = kolejność realizacji. Następny punkt oznacz `-> NEXT`.

- [ ] {zachowanie 1} -> NEXT  | poziom: unit
- [ ] {zachowanie 2}          | poziom: unit
- [ ] {zachowanie 3}          | poziom: integracja | dopisane w GREEN pkt 1: {powód}

## Pinezki (GREEN)
Zachowania przypięte testami. Nie zmieniać w REFACTOR.

- {zachowanie}: `{ścieżka testu}` ({nazwa testu})

## Decyzje i sprzeczności
- {data}: {decyzja lub rozwiązana sprzeczność TODO/pinezka}

## Postęp
- {punkt TODO}: RED / GREEN / REFACTOR, commit: {hash lub "brak"}
```

## Reguły

- Punkt TODO zamykasz (`[x]`) dopiero w zielonym stanie, razem z dopisaniem pinezki.
- Nowy punkt z GREEN dopisuj na właściwe miejsce w kolejności i zachowaj adnotację o pochodzeniu.
- Zmiana pinezki lub punktu TODO zawsze trafia do "Decyzje i sprzeczności".
- Hash commitu wpisuj przy następnym kroku (w momencie commitu nie jest jeszcze znany).
