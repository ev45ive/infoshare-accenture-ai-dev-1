# Checklista doprecyzowania

Zadaj pytania tylko o to, czego nie da się ustalić z kodu lub dokumentacji. Pytania grupuj (max kilka naraz), z opcjami i rekomendacją, gdy to możliwe.

- [ ] **Cel:** jakie zachowanie ma być po zmianie (jedno zdanie, obserwowalne z zewnątrz)?
- [ ] **Rodzaj:** nowa funkcja / zmiana zachowania / refaktor?
- [ ] **Istniejące zachowanie:** co dziś robi kod i czy jest już pokryty testami? Jeśli nie, które zachowania trzeba przypiąć przed zmianą?
- [ ] **Granice:** co jest poza zakresem tej zmiany?
- [ ] **Reguły biznesowe i liczby:** progi, wartości graniczne, zaokrąglenia, waluty. Źródło prawdy (np. `docs/product-contract.md`)?
- [ ] **Przypadki brzegowe:** puste dane, wartości ujemne, dokładnie na progu, duże ilości.
- [ ] **Poziom testów:** unit / integracja / e2e i dlaczego?
- [ ] **Definicja zielonego:** które komendy muszą przechodzić?
- [ ] **Stan wyjściowy:** czy repo jest teraz zielone?
- [ ] **Commity:** po każdym zielonym kroku, czy grupowo? Prefiks WIP?
