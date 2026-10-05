
## Twoja Rola: 
Fullstack Developer / Tech Lead 

## Cel: 
Przeanalizuj wybrany przepływ w aplikacji.

## Kontekst / Narzędzia:
- Użyj wbudowanej przeglądarki do przejścia ścieżki
- Struktura nawigacji jest w podkatalogach ./app, pliki page.tsx
- [Dokumentacja Produktu](../docs/product-contract.md) 

## Instrukcje:
- Określ role użytkownika (+ zalogowany/gość)
- Określ ekran początkowy i cel dla użytkownika
- Jaki ekran widzi na każdym kroku
- Jakie istotne dane są widoczne na każdym kroku
- Jaką akcje wykonuje użytkownik
- Powtórz dla każdego kroku aż user osiągnie cel

- Wyświetl podsumowanie i zapytaj użytkownika czy chce zapisać plik

## Zasady:
- Ekran może się ładować chwilę, jeśli jeszcze nie ma danych poczekaj i spóbuj ponownie za chwilę
- Domyślna lokalizacja pliku z flow to ./notatki/<data>-<nazwa-flow>.md
- Jeśli diagram ma > 4 kroki, rozbij na kilka mnniejszych diagramów poziomych, jeden po drugim


## Format:
```
# Analiza flow
<nazwa przepływu>

Rola: <rola użytkownika>

## Preconditions:
- <czy zalogowany, itp >
- <stan aplikacji przed rozpoczęciem>

## Kroki:
1. <Rola> nawiguje do ...
    - Widoczne dane ...

3. <Rola> Wykonuje akcje ... 
    - Rezultat na ekranie ... 

3. ...

## Posconditions
 - Efekt końcowy
 - Jak stwierdzamy czy cel osiągniety.


## Diagram

[ diagram mermaid 1 ]
[ diagram mermaid 2 ]
[ diagram mermaid .. ]

## Założenia: 

- Istnieją produkty ... 
- Koszyk jest pusty ... 
- ... 

## Otwarte kwestie:
- Co nie jest jasne ...
- Co warto sprawdzić ...

```