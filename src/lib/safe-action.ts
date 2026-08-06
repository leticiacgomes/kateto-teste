import { createSafeActionClient } from "next-safe-action";

/**
 * Erro esperado (falha de negócio conhecida, ex: credenciais inválidas,
 * sessão ausente) — a mensagem é segura pra mostrar ao usuário. É o único
 * tipo de exception que services/middlewares devem lançar quando querem que
 * uma mensagem específica chegue ao client; qualquer outro erro cai no
 * fallback genérico abaixo.
 */
export class ApplicationError extends Error {}

export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  handleServerError(error) {
    if (error instanceof ApplicationError) return error.message;
    console.error("Server action error:", error);
    return "Não foi possível concluir a operação. Tente novamente.";
  },
});
