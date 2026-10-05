import { z } from 'zod'

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Imię i nazwisko wymagane (min. 2 znaki)'),
    email: z.string().email('Nieprawidłowy format e-mail'),
    password: z
      .string()
      .min(8, 'Min. 8 znaków')
      .regex(/\d/, 'Wymagana co najmniej 1 cyfra')
      .regex(/[^a-zA-Z0-9]/, 'Wymagany co najmniej 1 znak specjalny'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Hasła nie są zgodne',
    path: ['confirmPassword'],
  })

export const LoginSchema = z.object({
  email: z.string().email('Nieprawidłowy format e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
})

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Nieprawidłowy format e-mail'),
})

export const ResetPasswordConfirmSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, 'Min. 8 znaków')
      .regex(/\d/, 'Wymagana co najmniej 1 cyfra')
      .regex(/[^a-zA-Z0-9]/, 'Wymagany co najmniej 1 znak specjalny'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Hasła nie są zgodne',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ResetPasswordRequestInput = z.infer<typeof ResetPasswordRequestSchema>
export type ResetPasswordConfirmInput = z.infer<typeof ResetPasswordConfirmSchema>
