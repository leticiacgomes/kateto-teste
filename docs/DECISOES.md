# Decisões técnicas

Registro de decisões estruturais tomadas durante o desenvolvimento, incluindo
sugestões do agente de IA e o racional de aceite/recusa. Ver `CLAUDE.md` para
o contexto de como o agente deve trabalhar neste repositório.

## Modelagem do banco (2026-08-06)

**Decisão**: entidades iniciais — `Dj`, `Skin`, `Representative`, `Lead`,
`RoundRobinState`, `User` — modeladas em `prisma/schema.prisma`.

Pontos confirmados com o usuário antes de modelar (via perguntas diretas, não
assumidos pelo agente):

- **Auth da área logada**: login único de admin (`User`: email +
  passwordHash), não um login por vendedor. Os 5 `Representative` existem só
  como destino do round robin, não autenticam.
- **Catálogo de DJs/Skins**: seed fixo (`prisma/seed.ts`), sem tela de CRUD
  no dashboard — fora do escopo do teste técnico.
- **Formulário de contato → Lead**: campos obrigatórios são nome, telefone e
  skin de interesse (`skinId` não é opcional). Sem campo de e-mail/mensagem.

`RoundRobinState` traduz a especificação do `CLAUDE.md` ("ponteiro do
próximo índice, persistido no banco") para um único registro (`id` fixo = 1)
com `nextIndex`, que aponta para `Representative.order` (0=Marcelo,
1=Rafael, 2=Renato, 3=Pedro, 4=Leonardo). A lógica de avanço em transaction
ainda será implementada em `services/lead.service.ts`, não neste commit.

## `Lead.position` como Int simples — decisão consciente, revisitar depois (2026-08-06)

**Decisão**: manter `position Int @default(0)` em `Lead` como está, mesmo
sabendo que mover um card entre dois outros exige renumerar (UPDATE) todos os
cards seguintes na coluna.

**Contexto**: o agente sugeriu trocar para uma estratégia de *fractional
indexing* — `position` como `Float`, calculando a média entre os dois
vizinhos ao mover um card, mesmo padrão que o Trello usa no campo `pos` dos
cards (variante float da técnica; Jira/Figma usam a variante com string
base36/base62, chamada LexoRank, mais robusta e mais complexa). Isso evitaria
tocar em qualquer card além do que está sendo movido.

**Por que ficou pra depois**: prioridade agora é ter a modelagem básica
funcionando; renumeração O(n) por movimentação é aceitável no volume de leads
esperado (kanban de vendas, poucas dezenas de cards por coluna) e não vale a
complexidade adicional neste momento do teste técnico.

**Melhoria futura**: se sobrar tempo, trocar `position` para `Float` e
implementar o cálculo de média entre vizinhos em `actions/card.actions.ts` /
`services/lead.service.ts` ao mover um card — mesmo padrão do Trello. Isso é
uma migration simples (`ALTER COLUMN position TYPE DOUBLE PRECISION`), não
exige mudar o restante do schema.

## Prisma 7 — sugestão do agente, aceita

**Sugestão**: usar Prisma 7 (versão instalada via `pnpm add prisma
@prisma/client`, já que não havia versão fixada antes) em vez de fixar
Prisma 6.

**Por quê isso importa**: Prisma 7 muda convenções que o `CLAUDE.md` original
pressupõe implicitamente (ex: `lib/prisma.ts` como singleton de
`@prisma/client`):

- Generator `prisma-client` (não mais `prisma-client-js`) exige `output`
  explícito — client é gerado em `generated/prisma/`, fora de
  `node_modules`, e **não deve ser commitado** (já está no `.gitignore`,
  adicionado automaticamente pelo `prisma init`).
- Não usar mais `url = env("DATABASE_URL")` dentro de `datasource` no
  `schema.prisma`. A connection string mora em `prisma.config.ts` +
  `.env` (`DATABASE_URL`).
- `PrismaClient` não é mais instanciado sem argumentos — exige um driver
  adapter (`@prisma/adapter-pg` + `pg` para Postgres):

  ```ts
  import { PrismaClient } from "../generated/prisma/client.js";
  import { PrismaPg } from "@prisma/adapter-pg";
  import pg from "pg";

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  ```

**Status**: aceito implicitamente ao pedir "começar o projeto" sem fixar
versão — mas fica registrado aqui porque `lib/prisma.ts` (ainda não criado)
vai precisar seguir esse padrão de adapter, diferente da maioria dos
tutoriais Next.js + Prisma que o usuário possa encontrar.

## Pendências para a próxima etapa

- [x] `lib/prisma.ts` — singleton do client com o driver adapter acima.
- [x] `services/lead.service.ts` — lógica de round robin, com testes em
      `tests/unit/`.
- [x] Estrutura de pastas ficou em `src/`, como descrito no `CLAUDE.md`.
- [ ] (Melhoria, não bloqueante) `Lead.position` de `Int` para `Float`
      seguindo o padrão do Trello — ver seção acima.

## `zod` como dependência direta (2026-08-06)

**Contexto**: `zod` já estava presente em `node_modules` como dependência
transitiva (via `next`/`prisma`), mas não declarada em `package.json`. O
`CLAUDE.md` especifica zod para validação de formulário, então foi promovido
a dependência direta (`pnpm add zod`) antes de criar
`validators/lead.schema.ts` — evita depender de uma versão que pode sumir se
uma dependência transitiva mudar.

## `validators/lead.schema.ts` + `actions/lead.actions.ts` (2026-08-06)

**Decisão**: `createLeadSchema` valida nome (2-120 caracteres), telefone
(normalizado para 10-11 dígitos, aceitando qualquer formatação de entrada) e
`skinId` (obrigatório), conforme os campos confirmados na seção "Modelagem
do banco" acima.

`createLeadAction` segue a assinatura `(prevState, formData)` do
`useActionState` (React 19), documentada em
`node_modules/next/dist/docs/01-app/02-guides/forms.md` desta versão do
Next — checado antes de escrever o código por causa do aviso em
`AGENTS.md` de que esta não é a versão de Next.js conhecida por padrão. A
action não lança exceção: retorna `{ status: "error", fieldErrors }` na
validação e `{ status: "error", message }` em falha do service, para o
formulário (próxima etapa, na landing pública) renderizar os dois casos sem
try/catch no componente.

Testado em `tests/unit/lead.actions.test.ts` com `leadService` mockado
(não com Prisma mockado) — o objetivo aqui é cobrir a validação e o
roteamento de erro da action, não repetir a cobertura de round robin que já
existe em `lead.service.test.ts`.
