# Współpraca nad projektem

## Środowisko

- Node 24.15.0, npm 11.12.1
- `npm ci` → `npm run workshop:setup` → `npm run dev` (http://127.0.0.1:3100)
- Reset bazy do stanu startowego: `npm run workshop:reset`

## Workflow

1. Utwórz branch z aktualnej gałęzi głównej: `feat/<opis>`, `fix/<opis>`, `docs/<opis>`, `refactor/<opis>`.
2. Wprowadź małą, spójną zmianę wraz z testami i aktualizacją dokumentacji.
3. Uruchom bramki jakości (poniżej).
4. Otwórz pull request z opisem: co, dlaczego, jak zweryfikowano.

## Commity

Format: `<typ>: <krótki opis>` (typy: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`).

## Bramki jakości (definicja „done")

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:e2e
```

- Zmiana zachowania ma test; nowa reguła biznesowa trafia do `docs/contracts/`.
- Zmiana wpływająca na użytkownika ma wpis w [CHANGELOG.md](CHANGELOG.md).
- Istotna decyzja architektoniczna ma wpis w [docs/adr/index.md](docs/adr/index.md).

## Code review

- Przeglądający sprawdza: zgodność z kontraktem, testy, brak sekretów, czytelność.
- Uwagi dotyczą kodu, nie osoby; autor odpowiada na każdą uwagę.

## Dokumentacja

- [README.md](README.md) — szybki start
- [docs/product-contract.md](docs/product-contract.md) — kontrakt produktu bazowego
- [docs/contracts/](docs/contracts/) — kontrakty zmian
- [docs/glossary.md](docs/glossary.md) — słownik pojęć
