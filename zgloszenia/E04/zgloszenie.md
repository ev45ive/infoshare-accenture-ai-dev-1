# E04 — Limit ilości — TDD i trzy poziomy kontroli

**Od:** Ola, właścicielka koszyka  
**Do:** Zespół developerski  
**Temat:** Nie więcej niż 10 sztuk produktu

```text
Cześć,

Chcemy ograniczyć zakup do 10 sztuk jednego produktu, z uwzględnieniem dostępnego stanu. Kontrolki w sklepie już ograniczają część wyborów, ale potrzebujemy ochrony reguły w całym koszyku. Przygotuj zmianę i dowody, że nie da się jej obejść zwykłą operacją koszyka.

Ola
```

## Zadania

1. Ustal przypadki z wymagania i z AI napisz test, który pokaże Red z właściwego powodu.
2. Wykonaj małą implementację, Green i refactoring z zachowaniem wyników.
3. Uruchom sensowne kontrole unit, integration i E2E, określając zakres każdej.
4. Sprawdź kontrolowaną regresję i rozwiń procedurę walidacji.

**Dla chętnych:** Sprawdź merge oraz spadek stanu magazynowego tuż przed checkout.

## Otwarte pytania

- Czy test wykrywa naruszenie reguły, czy jedynie powtarza kod?
- Jakiej operacji nie chroni samo ograniczenie przycisku w UI?
