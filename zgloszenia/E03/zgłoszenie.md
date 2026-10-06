# E03 — Wdrożenie darmowej dostawy

**Od:** Kamil, product owner  
**Do:** Zespół developerski  
**Temat:** Wdrożenie zaakceptowanej polityki dostawy

```text
Cześć,

Mamy uzgodniony kontrakt darmowej dostawy i plan zmiany. Wdróż proszę tę politykę tak, żeby klient widział właściwą kwotę, a zamówienie zapisywało ten sam koszt. Potrzebujemy małej zmiany gotowej do przeglądu wraz z wynikami kontroli.

Kamil
```


## Zadania

1. Zweryfikuj dostarczony kontrakt i wybierz pierwszą małą iterację.
2. Poprowadź AI przez implementację, przegląd diff i konkretny feedback.
3. Sprawdź zachowanie po obu stronach progu i zgodność UI z serwerem.
4. Zapisz stan wykonania oraz procedurę implementowania przyjętego planu.

**Dla chętnych:** Dodaj przypadek, w którym cena przesłana przez klienta nie może wyznaczyć kwoty zamówienia.

## Otwarte pytania

- Który konsument kwoty może pozostać zgodny z dawną regułą?
- Jakie twierdzenie o zmianie jest poparte wykonanym testem?
