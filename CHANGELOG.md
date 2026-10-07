# Changelog

Format wg [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), wersjonowanie wg [SemVer](https://semver.org/lang/pl/).

## [Unreleased]

### Added

- Dokumentacja: CONTRIBUTING, CHANGELOG, słownik pojęć, indeks ADR.

### Changed

- Limit ilości jednego produktu w koszyku wynosi `min(10, stan magazynowy)` dla gościa i zalogowanego; przekroczenie przy dodawaniu, zmianie ilości, łączeniu koszyków i w checkout jest blokowane lub przycinane z komunikatem ([kontrakt](docs/contracts/limit-ilosci-w-koszyku.md)).

## [0.1.0] - W01

### Added

- Bazowy sklep ShopEasy: katalog, koszyk, checkout z mockiem płatności, historia zamówień (zob. [docs/product-contract.md](docs/product-contract.md)).
