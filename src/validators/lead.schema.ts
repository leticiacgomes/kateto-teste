import { z } from "zod";

// Telefone BR: aceita formatação livre (espaços, parênteses, traço, +55),
// mas exige 10 ou 11 dígitos no total (fixo ou celular com 9º dígito).
const PHONE_DIGITS_REGEX = /^\d{10,11}$/;

export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine(
      (digits) => PHONE_DIGITS_REGEX.test(digits),
      "Informe um telefone válido com DDD.",
    ),
  skinId: z.string().trim().min(1, "Selecione uma skin."),
});

export type CreateLeadFormInput = z.infer<typeof createLeadSchema>;
