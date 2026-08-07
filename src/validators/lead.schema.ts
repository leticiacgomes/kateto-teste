import { z } from "zod";
import { zfd } from "zod-form-data";
import { LeadStatus } from "../../generated/prisma/enums";

// Telefone BR: aceita formatação livre (espaços, parênteses, traço, +55),
// mas exige 10 ou 11 dígitos no total (fixo ou celular com 9º dígito).
const PHONE_DIGITS_REGEX = /^\d{10,11}$/;

export const createLeadSchema = zfd.formData({
  // name/phone usam z.string() puro (não zfd.text): zfd.text() converte ""
  // em undefined antes de validar, o que faz o campo vazio cair no erro
  // genérico de tipo do Zod em vez das mensagens customizadas abaixo.
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
  cardId: zfd.text(z.string().trim().min(1, "Selecione um card.")),
});

export const moveLeadSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(LeadStatus),
  index: z.number().int().min(0),
});

export type CreateLeadFormInput = z.infer<typeof createLeadSchema>;
export type MoveLeadFormInput = z.infer<typeof moveLeadSchema>;
