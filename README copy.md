# ShopEasy — środowisko developerskie

Lokalny sklep demonstracyjny dla warsztatu AI. Frontend i backend są w TypeScript; Next.js 16, React 19, Prisma 7 i SQLite. Produkty, konta, wiadomości i płatności są fikcyjne. Numer karty i BLIK służą walidacji formularza; płatność wykonuje lokalny mock.

Otwórz w VS Code **tylko ten katalog aplikacji**. Materiały autora i rozwiązania są poza workspace. Wersje zależności odtwarza package-lock.json. Środowisko autora: Node 24.15.0 i npm 11.12.1; inne wersje wymagają próby przed zajęciami.

## Pierwsze uruchomienie

```text
npm ci
npm run workshop:setup
npm run dev
```

Adres: http://127.0.0.1:3100. Konto fikcyjne: `test@shopeasy.pl`, hasło `Test1234!`. Setup generuje lokalny sekret sesji w .env, tworzy własny workshop.db i inicjuje dane przy pierwszym tworzeniu bazy. Ponowne setup zachowuje istniejące dane; pełny reset jest osobną operacją. Nie kopiuj .env ani bazy z innej kopii.

## Reset i powrót do ćwiczenia

1. Zapisz swoją pracę i zatrzymaj serwer.
2. W tym katalogu wykonaj `npm run workshop:reset`.
3. Uruchom `npm run dev`.
4. W używanej przeglądarce otwórz http://127.0.0.1:3100/workshop/reset i naciśnij „Wyczyść stan przeglądarki”.

Reset bazy usuwa zmiany danych i odtwarza 3 kategorie, 12 produktów, 12 wariantów oraz 1 aktywne konto. Koszyk, adresy, zamówienia, historia statusów, tokeny resetu i konto lojalnościowe są puste. Reset przywraca normalny mock i 250 ms timeoutu, zmienia sekret oraz unieważnia wcześniejsze sesje. Restart usuwa pamięć wiadomości i stan procesu. Krok przeglądarkowy usuwa cookie sesji oraz klucze `shopeasy-guest-cart` i `checkout_delivery`; ponownie opróżnia wiadomości. Aplikacja nie używa service workera ani IndexedDB.

Reset **nie cofa kodu**. Aby rozpocząć inne ćwiczenie, użyj jego nowej kopii startowej. Zapas ma własną kopię i nie przenosi zmian do Core. Stary katalog pracy zostaje zachowany. Każda kopia ma osobną bazę i .env. Preferowany jest jeden aktywny serwer; równolegle uruchamiane kopie muszą mieć różne porty.

## Kontrole

```text
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:mcp
npm run workshop:reset
npm run test:e2e
npm run build
```

Unit używa Node test runner i tsx. Integracja tworzy i odtwarza osobną `.workshop/integration.db`; nie zmienia głównego workshop.db. E2E uruchamia własny serwer na 3100 i potrzebuje czystej bazy oraz wolnego portu. Domyślna przeglądarka testowa to lokalny Microsoft Edge w trybie bez okna. Zmianę przeglądarki wykonaj w playwright.config.ts po sprawdzeniu jej dostępności. Wyniki i obrazy E2E są w .workshop, a ślady błędów w test-results. E2E tworzy zamówienie, więc po nim wykonaj reset przed pracą na baseline.

## Mock płatności

Zatrzymaj serwer, wykonaj `npm run workshop:mode -- always_fail` lub `npm run workshop:mode -- always_timeout` i uruchom serwer ponownie. Tryb `normal` przywraca sukces. Reset zawsze przywraca normalny tryb. Timeout jest lokalną odpowiedzią po domyślnie 250 ms; nie łączy się z bankiem ani nie czeka 35 sekund.

## Copilot i MCP

Minimalny kontekst jest w .github/copilot-instructions.md, a startery promptu, Skills i agentów w .github. Rozwijasz je w trakcie warsztatu. Rozpoznanie konfiguracji oraz dostęp funkcji trzeba sprawdzić na własnym koncie VS Code/Copilot przed zajęciami.

Serwer `workshop-docs` z .mcp.json jest lokalny, działa przez stdio i udostępnia dwa narzędzia tylko do odczytu: wyszukiwanie oraz odczyt dokumentu. Dane są w **osobnym katalogu ../mcp-fixtures**, poza repo aplikacji. Pakiet startowy musi zawierać ten katalog obok aplikacji. `npm run test:mcp` wykonuje rzeczywiste wywołania przez klienta SDK; nie potwierdza jeszcze wywołania z Twojego konta Copilota.

## Referencje produktu

Zachowanie bazowe i jednostki: docs/product-contract.md. Polecenie bieżącego zadania pochodzi z jego briefu; kolejne ćwiczenia mogą mieć inny kontrakt i własny stan startowy.
