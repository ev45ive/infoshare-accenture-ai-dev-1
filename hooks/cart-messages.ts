export const CART_MESSAGES = {
  itemsLimit: (limit: number) => `Maksymalnie ${limit} szt. tego produktu.`,
  itemsLimitStock: (limit: number, stock: number) =>
    `Maksymalnie ${limit} szt. tego produktu (dostępne: ${stock}).`,
  unavailable: 'Ten produkt nie jest dostępny',
  itemsLimitPremium:
    'Osiągnięto limit pozycji dla konta standardowego (5). Usuń produkt lub przejdź na konto Premium.',
} as const
