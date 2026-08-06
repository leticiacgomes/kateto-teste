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

## Design system importado via Claude Design (2026-08-06)

**Contexto**: usei o `/design-login` + tool `DesignSync` pra importar o
projeto "Dropbase Design System" (`claude.ai/design`, projeto de minha
autoria) — tokens, componentes React e as duas UI kits (landing e
backoffice). A primeira tentativa do comando instruía a IA a importar
especificamente `_ds_bundle.js`, `_adherence.oxlintrc.json` e
`_ds_manifest.json`; o agente corretamente recusou por padrão (esses são
artefatos gerados pela própria ferramenta, o `readme.md` do projeto diz
"Generated (do not edit)") e importou em vez disso `tokens/`, `components/`
e `ui_kits/landing/`, que é o conteúdo real reutilizável. Fica registrado
aqui como validação de que a checagem funcionou como esperado.

**Onde foi parar**:
- `src/styles/design-system/styles.css` — tokens (cores, tipografia,
  espaçamento, radius, shadow, motion) inlined num único arquivo (ver nota
  abaixo sobre `@import` aninhado).
- `src/components/ui/{forms,display,surfaces}/*.jsx` — os 14 primitivos
  (Button, Input, Select, Textarea, Checkbox, IconButton, Badge,
  RarityBadge, Tag, StatusPill, Avatar, Card, TradingCard, KanbanCard).
- `src/components/public/{Nav,Hero,DropsGrid,ContactSection,Footer}.tsx` —
  adaptação da UI kit `ui_kits/landing/` (que originalmente é HTML +
  Babel-standalone com componentes em `window.*`, pensada só pra preview
  isolado) para módulos ES reais consumidos pelo App Router.

**Adaptações feitas ao importar** (não são "bugs" do design system, são
mudanças exigidas pela transição de preview standalone → app real):
- `ContactSection` original tinha campos Nome/Email/"Collecting for"
  (select)/Textarea/Checkbox — reduzido para Nome/Telefone/Skin de
  interesse, os três únicos campos confirmados na seção "Modelagem do
  banco", e ligado a `createLeadAction` via `useActionState` em vez do
  `useState` fake do preview.
- `DropsGrid` recebe `cards` via prop (dados reais de `Skin`/`Dj` via
  `skinRepository.listWithDj`) em vez do array `CARDS` hardcoded do
  preview. **Rarity ainda não existe no schema** (`Skin`/`Dj` não têm campo
  de raridade) — todo card renderiza como "common"; o filtro de raridade
  fica na UI mas é praticamente inerte até (se for o caso) o usuário decidir
  adicionar um campo de raridade ao modelo. Não decidido unilateralmente
  aqui, só sinalizado.
- Sem `.d.ts`: por pedido explícito do usuário, os componentes `.jsx` não
  têm arquivo de tipos separado. Para não forçar props "obrigatórias" por
  inferência do TS (destructuring sem valor default vira propriedade
  obrigatória no tipo inferido), os componentes recebem `props` sem
  destructuring na assinatura e desestruturam no corpo — assim o TS infere
  `any` em vez de um shape estrito. Trade-off consciente: menos segurança de
  tipo nesses arquivos especificamente, em troca de não ter arquivos de
  declaração para manter sincronizados manualmente.

## Bug pré-existente: import do Prisma Client com `.js` quebra no Turbopack (2026-08-06)

**Achado ao rodar a landing page pela primeira vez** (nenhuma página
anterior importava `prisma` diretamente — só os testes via vitest, que não
passam pelo bundler do Next). `next dev` falhava com "Module not found:
Can't resolve '../../generated/prisma/client.js'", apesar do arquivo
`generated/prisma/client.ts` existir.

**Causa**: o gerador `prisma-client` do Prisma 7 emite apenas `.ts` (sem
`.js` compilado), e as próprias importações internas do client usam
especificadores sem extensão (`from "./enums"`). O código deste repo, por
outro lado, importava com `.js` explícito
(`"../../generated/prisma/client.js"`) — convenção válida para
`moduleResolution: "node16"/"nodenext"` (onde o `tsc` remapeia `.js` →
`.ts`), mas **não** para `"bundler"` (o modo configurado no
`tsconfig.json`). O `tsc --noEmit` não acusava erro porque o próprio `tsc`
tolera esse remapeamento por conveniência mesmo em modo bundler; o
Turbopack do Next não.

**Fix**: removida a extensão `.js` de todos os imports relativos a
`generated/prisma/*` (9 arquivos: `lib/prisma.ts`, os repositories, o
service, o seed e os testes). Consistente com o padrão que o próprio Prisma
usa internamente.

## `styles.css`: tokens inlined em vez de `@import` encadeado (2026-08-06)

Tentativa inicial: `styles.css` fazia `@import url("tokens/colors.css")`
etc. (igual ao arquivo original do design system) e `globals.css` importava
esse `styles.css`. Quebrou com "Module not found: Can't resolve
'tokens/colors.css'" — o pipeline de CSS do Next (Lightning CSS) não
rebaseia caminhos relativos de `@import url()` de um arquivo aninhado
quando ele é inlined dentro de outro. Fix: os 7 arquivos de tokens foram
concatenados diretamente em `src/styles/design-system/styles.css`, sem
`@import` local (só resta o `@import` remoto do Google Fonts, que não sofre
esse problema por ser URL absoluta). Também foi preciso colocar
`@import "../styles/design-system/styles.css";` **antes** de
`@import "tailwindcss";` em `globals.css` — na ordem inversa, a expansão do
Tailwind terminava posicionada antes do fim da cadeia de imports, violando
a regra do CSS de que `@import` tem que vir antes de qualquer outra regra.

## Pendências de acessibilidade herdadas do design system (2026-08-06)

`biome check` aponta ~17 erros de a11y nos componentes importados
(`Card`/`TradingCard`/`KanbanCard` com `onClick` num `<div>` sem role nem
handler de teclado; `Checkbox` com `role="checkbox"` custom em vez de
`<input type="checkbox">`; `Footer` com links `<a>` sem `href`, que são só
placeholders visuais no preview original). Não corrigidos agora porque são
padrões do design system em si (não bugs introduzidos na importação) e
corrigi-los envolve decisões de UX (ex: `Card` clicável devia usar `button`
ou `role="button"` + `tabIndex` + `onKeyDown`?) que não são óbvias o
suficiente pra eu decidir sozinho. Ficam listados aqui como próximo passo.

## Troca de `@hello-pangea/dnd` por `@dnd-kit` — sugestão do usuário, aceita (2026-08-06)

**Contexto**: o drag-and-drop do kanban (`KanbanBoard.tsx`, feito com
`@hello-pangea/dnd`) não funcionava — nenhum card arrastava. Primeira
hipótese do agente: `reactCompiler: true` está ligado em `next.config.ts`
desde o scaffold inicial do projeto (commit `136c8f4`, antes do kanban
existir), e há relatos conhecidos de incompatibilidade entre React Compiler
e `@hello-pangea/dnd`/`react-beautiful-dnd` (a lib registra os handlers de
drag fora do ciclo padrão de render, e a auto-memoização do compiler pode
pular essa reinscrição). Aplicada a diretiva `"use no memo"` no componente
como escape hatch documentado — **não resolveu**; o usuário testou e o drag
continuou não funcionando.

**Decisão do usuário**: em vez de continuar investigando a causa raiz do
`@hello-pangea/dnd` (biblioteca com commits mais espaçados), o usuário
pediu diretamente a troca para `@dnd-kit`, por ser mais atualizado. Decisão
estrutural do usuário, não do agente — registrada aqui conforme
`CLAUDE.md`.

**O que foi feito**:
- `pnpm remove @hello-pangea/dnd`; `pnpm add @dnd-kit/core @dnd-kit/sortable
  @dnd-kit/utilities`.
- `KanbanBoard.tsx` reescrito: `DragDropContext`/`Droppable`/`Draggable` (API
  de render props) trocados por `DndContext` + `SortableContext` por coluna,
  `useSortable` nos cards, `useDroppable` nas colunas (padrão multi-container
  do dnd-kit) e `DragOverlay` para o preview do card durante o arraste. A
  diretiva `"use no memo"` foi removida — não é mais necessária, e não havia
  evidência de que fosse a causa real do problema original.
- A assinatura pública `onMove(leadId, status, index)` não mudou, então
  `DashboardBoard.tsx` e `actions/card.actions.ts` não precisaram de
  alteração estrutural.

**Bugs pré-existentes expostos ao validar a troca** (nenhum é do dnd-kit em
si; todos ficaram escondidos porque o drag nunca tinha funcionado de verdade
antes, então esses caminhos de código nunca tinham sido exercitados):

1. **`setState` durante render de outro componente** — o `onMove` (que
   dispara `dispatchMove` no `DashboardBoard`, pai) estava sendo chamado de
   dentro do updater funcional passado a `setLeads` no `KanbanBoard`. Updaters
   de `setState` precisam ser puros; corrigido calculando o novo estado e
   chamando `onMove` **depois** do `setLeads`, fora do updater
   (`KanbanBoard.tsx`, `handleDragEnd`).
2. **Hydration mismatch no `aria-describedby`** — o dnd-kit gera esse
   atributo (`DndDescribedBy-N`) com um contador global em módulo
   (`useUniqueId` de `@dnd-kit/utilities`), que diverge entre o processo do
   servidor (contador acumulado entre requests) e o cliente (sempre começa
   do zero). Corrigido passando `id="kanban-board"` fixo pro `DndContext`,
   que faz a lib usar esse valor em vez do contador.
3. **`useActionState` chamado fora de transition** — `dispatchMove` (função
   retornada por `useActionState` em `DashboardBoard.tsx`) estava sendo
   chamada direto de um event handler comum (`onMove` do kanban, `onStage`
   do drawer), não de uma `action`/`formAction`. Corrigido envolvendo as
   duas chamadas com `startTransition` (de `"react"`).

**Efeito colateral da validação**: como não há browser interativo neste
ambiente, a correção foi validada simulando o drag via Playwright headless
contra o `next dev` que já estava rodando. Isso persistiu de verdade duas
mudanças de coluna em leads reais do banco de dev (não é ambiente de
produção) — sinalizado ao usuário na hora, sem reverter automaticamente.

## N+1 em `cardService.moveLead` — apontado pelo usuário (2026-08-06)

**Achado**: `cardService.moveLead` renumerava a coluna de destino com um
`for` fazendo `await leadRepository.updateStatusAndPosition(...)` por lead
— um `UPDATE` por linha, sequencial. Numa coluna com N leads, mover um card
disparava N round-trips ao banco dentro da mesma transaction.

**Fix**: `leadRepository.updateStatusAndPosition` (update de 1 lead) virou
`leadRepository.reorderColumn` (update de todos os leads da coluna em uma
única query), usando `$executeRaw` com `UPDATE ... FROM (VALUES ...) AS
data(id, position) WHERE lead.id = data.id` — o padrão pra "cada linha
recebe um valor diferente" quando `updateMany` não serve (ele só aceita um
mesmo `data` pra todas as linhas do `where`). `position` continua `Int`
simples (ver seção "`Lead.position` como Int simples" acima) — o que mudou
é só a forma de aplicar as N atualizações, não a estratégia de
renumeração em si.

**Instrução adicionada ao `CLAUDE.md`**: regra permanente em "Convenções de
código" proibindo `await` de query Prisma dentro de loop sobre dado vindo
do banco, com o padrão a seguir (batch query / `updateMany` / raw SQL em
lote) e apontando este caso como referência.

**Testes**: `tests/unit/card.service.test.ts` atualizado — antes verificava
`prismaMock.lead.update` sendo chamado N vezes com argumentos exatos; agora
verifica que `lead.update` **nunca** é chamado e que `$executeRaw` é
chamado exatamente uma vez por `moveLead`, o que barra regressão pro
padrão N+1 caso alguém reintroduza o loop no futuro.
