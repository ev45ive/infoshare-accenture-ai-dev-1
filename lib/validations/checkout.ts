import { z } from 'zod'

export const AddressSchema = z.object({
  firstName: z.string().min(2, 'Wymagane (min. 2 znaki)'),
  lastName: z.string().min(2, 'Wymagane (min. 2 znaki)'),
  street: z.string().min(5, 'Wymagane (min. 5 znaków)'),
  city: z.string().min(2, 'Wymagane (min. 2 znaki)'),
  postalCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, 'Format: XX-XXX (np. 00-001)'), // BR-09
  country: z.string().default('PL'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-]{9,15}$/, 'Nieprawidłowy numer telefonu'),
})

export const CardPaymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, '16 cyfr bez spacji'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/RR (np. 12/27)'),
  cvv: z.string().regex(/^\d{3,4}$/, '3 lub 4 cyfry'),
  name: z.string().min(3, 'Imię i nazwisko posiadacza karty'),
})

export const BlikSchema = z.object({
  code: z.string().regex(/^\d{6}$/, '6-cyfrowy kod BLIK'),
})

export type AddressInput = z.infer<typeof AddressSchema>
export type CardPaymentInput = z.infer<typeof CardPaymentSchema>
export type BlikInput = z.infer<typeof BlikSchema>
