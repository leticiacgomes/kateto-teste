import { z } from "zod";
import { zfd } from "zod-form-data";

// Telefone BR: aceita formatação livre (espaços, parênteses, traço, +55),
// mas exige 10 ou 11 dígitos no total (fixo ou celular com 9º dígito).
const PHONE_DIGITS_REGEX = /^\d{10,11}$/;

export const createLeadSchema = zfd.formData({
  name: zfd.text(
    z
      .string()
      .trim()
      .min(2, "Informe seu nome completo.")
      .max(120, "Nome muito longo."),
  ),
  phone: zfd.text(
    z
      .string()
      .trim()
      .transform((value) => value.replace(/\D/g, ""))
      .refine(
        (digits) => PHONE_DIGITS_REGEX.test(digits),
        "Informe um telefone válido com DDD.",
      ),
  ),
  skinId: zfd.text(z.string().trim().min(1, "Selecione uma skin.")),
});

export type CreateLeadFormInput = z.infer<typeof createLeadSchema>;
