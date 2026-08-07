# Decisões técnicas — registro completo

Este é o log bruto e cronológico de tudo que foi decidido, sugerido, testado
e corrigido durante o desenvolvimento — incluindo debugging, becos sem saída
e detalhes de implementação. Ficou grande demais pra servir como leitura de
apresentação, então os pontos principais foram resumidos em
[`DECISOES.md`](./DECISOES.md).

Mantenho este arquivo porque quero usá-lo depois pra estudar o projeto com
calma — ele tem o "como cheguei lá", não só o "o que ficou decidido".

Ver `CLAUDE.md` para o contexto de como o agente deve trabalhar neste
repositório.

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

**Atualização (2026-08-06, ver "Varredura de conformidade com
`frontend-design`" mais abaixo)**: `Card`/`TradingCard`/`KanbanCard` e
`Checkbox` já estavam corrigidos em algum commit posterior a este registro
(hoje usam `<button type="button">` e `<input type="checkbox">` reais,
respectivamente — conferido lendo o código atual antes de reportar). Só o
item do `Footer` ainda estava pendente; resolvido na varredura de hoje.

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

## Autenticação da área logada: NextAuth v5 (beta) + Credentials, JWT sem adapter (2026-08-06)

**Contexto**: o dashboard (`/dashboard`) estava com zero proteção — nenhuma
sessão, nenhuma rota de login, nenhum middleware — apesar do `CLAUDE.md`
especificar "NextAuth (Credentials provider)" e do model `User` já existir
no schema desde a modelagem inicial. Esse foi o próximo passo assumido pelo
agente após revisão do estado do projeto, confirmado com o usuário antes de
começar (login único de admin, não um login por vendedor — já estava restrito
na seção "Modelagem do banco" acima).

**Versão do NextAuth**: `next-auth@5.0.0-beta.32` (Auth.js v5), não a v4.
Checado antes de instalar: o `peerDependencies` da v5 aceita
`next: "^14.0.0-0 || ^15.0.0 || ^16.0.0"`; a v4 não suporta o App Router da
forma como o projeto usa (Server Actions, `auth()` como helper universal).
Ainda em beta upstream, mas é a única linha da lib compatível com Next 16 —
registrado aqui porque é uma dependência de versão pre-1.0, para o caso de
precisar revisar se uma versão estável sair depois.

**Sessão**: estratégia `jwt` (sem `adapter`, sem tabela `Session` no
schema). Coerente com o `CLAUDE.md` já ter modelado `User` só com
`email`/`passwordHash`/`name` — não haveria onde guardar sessões de banco
sem adicionar uma tabela nova, e o Credentials provider do NextAuth exige
JWT quando não há adapter.

**Senha**: `bcryptjs` (puro JS) em vez de `bcrypt` (binding nativo,
`node-gyp`). Evita depender de toolchain de compilação C++ dentro do
container só pra hashear senha — o custo de performance de `bcryptjs` é
irrelevante no volume de logins de um admin único.

**Descoberta que quase quebrou tudo — `middleware.ts` foi renomeado pra
`proxy.ts` nesta versão do Next.js**: o padrão universal de proteger rotas
com NextAuth é um `middleware.ts` que envolve `auth()`. Seguindo o aviso do
`AGENTS.md` (esta não é a versão de Next.js do treinamento), o agente
checou `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
**antes** de escrever esse arquivo — confirma: *"The `middleware` file
convention is deprecated and has been renamed to `proxy`"*. O arquivo é
`src/proxy.ts` (mesmo nível de `app/`, dentro de `src/`), com export
default recebendo `NextRequest`/devolvendo `NextResponse` — o wrapper
`auth()` do NextAuth não sabe nem se importa com o nome do arquivo, só
precisa desse contrato, então `export default auth((req) => {...})`
funciona igual estaria em `middleware.ts`. Validado batendo direto na API
(`/api/auth/callback/credentials`, `/api/auth/signout`) via `curl` com jar
de cookies contra o `next dev` já rodando: senha certa redireciona pra
`/dashboard` com cookie de sessão válido (200 nas requisições seguintes),
senha errada volta pra `/login?error=CredentialsSignin`, e depois do
signout o `/dashboard` volta a dar 307 pro login.

**Onde ficou** (seguindo a arquitetura de pastas do `CLAUDE.md`):
- `src/repositories/user.repository.ts` — `findByEmail`.
- `src/services/auth.service.ts` — `verifyCredentials(email, password)`,
  isolado de UI/rota (mesmo padrão de `services/lead.service.ts`), testado
  em `tests/unit/auth.service.test.ts` sem subir NextAuth nem Prisma real.
- `src/auth.ts` — config do NextAuth (`handlers`, `signIn`, `signOut`,
  `auth`), Credentials provider chamando `authService.verifyCredentials`.
- `src/app/api/auth/[...nextauth]/route.ts` — a única rota HTTP que o
  `CLAUDE.md` já previa pro NextAuth, reexportando `handlers.GET/POST`.
- `src/proxy.ts` — protege `/dashboard/*`, redireciona autenticado saindo
  de `/login`.
- `src/actions/auth.actions.ts` — `loginAction` (`useActionState`, captura
  `AuthError` do NextAuth e devolve mensagem genérica em português) e
  `logoutAction` (usado num `<form action={logoutAction}>` no `Topbar`, sem
  precisar de client component).
- `src/app/login/page.tsx` + `src/components/auth/LoginForm.tsx`.
- `types/next-auth.d.ts` — module augmentation pra `session.user.id`.

**Seed do admin**: `prisma/seed.ts` cria/atualiza (`upsert`) um `User` com
`bcrypt.hash`. Credenciais via `ADMIN_EMAIL`/`ADMIN_PASSWORD` (env), com
fallback pra `admin@dropbase.com` / `dropbase123` em dev — documentado no
`.env.example`. Não é uma tela de cadastro de usuário (fora de escopo, só
existe 1 admin), então seed é o único jeito de criar/trocar essa conta por
enquanto.

**Pendência**: `AUTH_SECRET` no `.env` local foi gerado com
`openssl rand -base64 32` só pra dev; **precisa ser regenerado** antes de
qualquer deploy real (o valor de dev não deve ir pra produção).

## Auth em Server Actions: do check isolado no `proxy.ts` a `next-safe-action` (2026-08-06)

**Contexto**: registro, a pedido do usuário, da sequência de perguntas que
levou a essa decisão — começou como revisão de commit, não como pedido de
mudança de arquitetura.

1. Usuário pediu revisão do commit `b885bd8` ("feat: add next auth"),
   apontando que `proxy.ts` era a única checagem de auth do projeto e
   perguntando se isso contrariava a doc do Next.js. Confirmado: doc local
   (`node_modules/next/dist/docs/01-app/02-guides/data-security.md`) diz
   explicitamente *"A page-level authentication check does not extend to the
   Server Actions defined within it. Always re-verify inside the action"* e
   que proxy *"should not be used as a full session management or
   authorization solution"*. `card.actions.ts#moveLeadAction` de fato não
   reverificava sessão nenhuma — bug real, não hipotético.
2. Usuário pediu a checagem nas Server Actions → `auth()` adicionado inline
   em `moveLeadAction`.
3. Usuário perguntou se a página do dashboard também precisava de checagem
   própria ("isso me cheira mal"). Agente propôs replicar o padrão na page;
   usuário recusou por redundância com o proxy nesse escopo (uma rota
   protegida só) — sinalizado como over-engineering pro tamanho do projeto.
4. **Bug real encontrado pelo usuário** ao testar manualmente: deletou o
   cookie de sessão, tentou mover um card no kanban, e recebeu `Uncaught
   Error: An unexpected response was received from the server` em vez de um
   redirect. Causa raiz: `proxy.ts` intercepta o POST que invoca a Server
   Action (mesma rota `/dashboard`) e devolve um `NextResponse.redirect`
   cru, que quebra o protocolo de resposta que o client runtime de Server
   Actions espera — a checagem da action (item 2) nunca chegava a rodar
   porque o proxy barrava a requisição antes.
5. Fix em duas partes: (a) `proxy.ts` passou a identificar invocações de
   Server Action pelo header `next-action` (usado internamente pelo Next —
   confirmado em
   `node_modules/next/dist/server/app-render/action-handler.js`) e não
   redirecionar essas requisições; (b) a checagem dentro da action virou a
   responsável real por barrar acesso sem sessão, devolvendo um resultado
   tipado (`{ ok: false, message }`) que o client já sabia renderizar.
6. Usuário notou que a lógica de auth passou a viver em dois lugares
   (`proxy.ts` e cada action) e pediu pra centralizar, pensando em reuso.
   Criado `src/middlewares/auth.middleware.ts` (`authMiddleware()`), usando
   `redirect()` de `next/navigation` em vez de `NextResponse.redirect` —
   funciona tanto em Server Components quanto dentro de Server Actions,
   porque o Next trata esse caso de forma especial (navegação client-side
   via `NEXT_REDIRECT`, não um redirect HTTP cru como o do proxy).
7. Usuário apontou que ainda precisaria chamar `authMiddleware()`
   manualmente em toda action protegida. Criado `withAuth()`, higher-order
   function que embrulha a action — mesmo padrão do decorator
   `@login_required` do Django (explicado ao usuário nesses termos, já que
   é sua referência prévia).
8. Usuário perguntou se existe forma mais legível de compor middleware +
   validação em Server Actions, já que aninhar `withAuth(withValidation(schema,
   fn))` não escala conforme mais actions/validações forem adicionadas.

**Decisão**: adotar `next-safe-action` pra compor middleware (auth) e
validação de input (zod, já no stack) de forma declarativa (`.use()` /
`.inputSchema()` / `.action()`), substituindo o padrão de HOFs aninhadas
(`withAuth`, e um eventual `withValidation`) por uma API única e mais
legível.

**Status: implementado.**

- `pnpm add next-safe-action` (`8.6.0`).
- `src/lib/safe-action.ts` — `actionClient` base, com `handleServerError`
  central: erros esperados (`ActionError`, ex: sessão ausente) devolvem a
  própria mensagem; qualquer outro erro vira uma mensagem genérica em
  português (equivalente ao `except Exception` + resposta 500 genérica que
  se faria numa `APIView` do DRF, pra não vazar detalhe interno).
- `src/middlewares/auth.middleware.ts` — `withAuth`/`authMiddleware`
  (baseados em `redirect()`) removidos; substituídos por
  `authActionClient = actionClient.use(...)`, que checa `auth()` e lança
  `ActionError` se não houver sessão. **Escolha deliberada**: não usar
  `redirect()` aqui — a própria doc da lib
  (`/docs/troubleshooting`, seção "redirect() doesn't work inside actions")
  avisa que chamar `redirect()` dentro de uma action gerenciada pela lib é
  um problema conhecido. Lançar erro e deixar o `serverError` tipado
  chegar ao client (padrão que a lib já foi desenhada pra isso) evita essa
  armadilha.
- `src/actions/card.actions.ts` — `moveLeadAction` reescrita como
  `authActionClient.inputSchema(moveLeadSchema).action(...)`; o
  `VALID_STATUSES`/try-catch manual de antes (validação de status +
  mensagem genérica de erro) saiu do código — zod cobre a validação e
  `handleServerError` cobre o catch-all, ambos centralizados.
- `src/components/kanban/DashboardBoard.tsx` — chamada adaptada pra `input`
  único (`moveLeadAction({ leadId, status, index })`, formato que a lib
  exige, em vez de argumentos posicionais) e leitura do resultado via
  `result.serverError` / `result.validationErrors` em vez do
  `MoveLeadActionResult` próprio de antes. Continua em cima de
  `useActionState` nativo do React — não migrado pro `useAction`/
  `useStateAction` da lib, pra não alterar o fluxo de drag-and-drop
  (`startTransition`) que já funciona.

**Escopo — só `card.actions.ts` migrado, não `lead.actions.ts`/
`auth.actions.ts`**: o problema relatado pelo usuário (compor auth +
validação de forma legível) só existe em `moveLeadAction`, a única action
que precisa das duas coisas juntas. `createLeadAction` (form público da
landing) já usa zod isoladamente, sem auth, e depende do formato
`(prevState, formData)` do `useActionState` nativo pra funcionar sem JS
(progressive enhancement) — migrar pra `next-safe-action` exigiria trocar
esse form pro hook próprio da lib (`useStateAction`), que **não** suporta
esse caso sem JS (aviso explícito na doc da lib). `auth.actions.ts`
(login/logout) não tem validação de input própria além do que o NextAuth já
faz. Migrar os três só por consistência seria mudança sem necessidade real
— journal atualizado aqui em vez de fazer isso "de graça".

**Testado**: `tests/unit/card.service.test.ts` (não tocado — a mudança foi
na camada de action, não de service) continua passando, `3 passed`.
`tsc --noEmit` sem erros novos além dos pré-existentes por dependências não
instaladas neste ambiente sandbox (`next-auth`, `bcryptjs`).

## Varredura de conformidade com `frontend-design` (2026-08-06)

**Contexto**: usuário pediu pra escanear todos os componentes e corrigir o
que não seguisse as 4 regras de `.claude/skills/frontend-design/SKILL.md`
(mobile-first, acessibilidade, proibição de fetch no client, design system).
Nenhum fetch client-side encontrado — os outros três pontos tinham dívida
real, listada abaixo.

**Mobile-first**:
- `ContactSection.tsx` tinha `grid-cols-2` fixo (o exemplo que o próprio
  `SKILL.md` já citava como pendente) → `grid-cols-1 md:grid-cols-2`.
- `Footer.tsx` tinha `grid-cols-[2fr_1fr_1fr_1fr]` fixo, quebraria a partir
  de ~500px → `grid-cols-2` (coluna da marca em `col-span-2`) até `sm`,
  volta ao grid original em `sm:`.
- `Hero.tsx`/`Nav.tsx`/`DropsGrid.tsx`/`ContactSection.tsx`: padding
  horizontal fixo (`px-10`) e `text-[66px]` no H1 do Hero, que estourava a
  largura em ~360px → padding e tamanho de fonte escalonados
  (`px-5 sm:px-10`, `text-h2 sm:text-h1 md:text-display`).
- **Sidebar do dashboard** (`Sidebar.tsx`) era um painel fixo de 220px
  sempre visível — em 360px sobrava ~140px pro kanban. Convertida pra
  off-canvas: escondida por padrão em mobile (`-translate-x-full`,
  `md:translate-x-0` fixo), acionada por um botão hambúrguer novo no
  `Topbar.tsx` (`md:hidden`), estado (`sidebarOpen`) levantado pro
  `DashboardBoard.tsx` (componente pai já client) por ser compartilhado
  entre os dois irmãos.
- **`LeadDrawer.tsx`** tinha `w-[420px]` fixo, estourava horizontalmente em
  mobile. Convertido em bottom-sheet abaixo de `sm` (`inset-x-0 bottom-0
  max-h-[85vh] rounded-t-xl`) e volta a ser painel lateral de 420px a partir
  de `sm:`. Estes dois casos (sidebar → off-canvas, drawer → bottom-sheet)
  são exatamente os exemplos que o próprio `SKILL.md` já citava como
  "componente que ainda não existe no design system pra funcionar bem em
  mobile — construa, não pule a responsividade" — tratado como
  pré-autorizado por essa cláusula, sem pausar pra confirmar (diferente de
  uma decisão de design system nova, tipo cor semântica).

**Acessibilidade**:
- `Footer.tsx`: os "links" de navegação eram `<span className="cursor-pointer">`
  sem `href`, sem foco de teclado, sem role — resolve a pendência já
  registrada acima em "Pendências de acessibilidade herdadas do design
  system". Como não existem páginas de destino reais neste teste técnico,
  virou `<button type="button">` (não `<a href="#">`) — testado com
  `biome check`, que rejeita `href="#"` como URL inválida
  (`lint/a11y/useValidAnchor`); `<button>` é semanticamente correto pra um
  elemento clicável sem navegação real.
- `DropsGrid.tsx`: o `<Select>` de filtro de raridade não tinha `label` nem
  `aria-label` — só existia visualmente ao lado do texto "CARDS", sem
  associação programática. Adicionado `aria-label="Filtrar por raridade"`.
- `Sidebar.tsx`: item de nav ativo (`Leads`) ganhou `aria-current="page"`.

**Design system (tokens em vez de valores arbitrários)**: varredura por
`text-\[[0-9]+px\]` / `tracking-\[...\]` / `rounded-\[...\]` fora de `ui/*`
encontrou uso generalizado de pixels arbitrários (`text-[14px]`,
`text-[22px]`, `tracking-[-0.02em]` etc.) em `Hero`, `Nav`, `ContactSection`,
`DropsGrid`, `Footer`, `Sidebar`, `Topbar`, `KanbanBoard`, `LeadDrawer` e
`app/login/page.tsx`, mesmo quando havia token exato equivalente
(`text-micro`=11px, `text-caption`=12px, `text-body-sm`=13px, etc.) —
provavelmente sobra da importação do design system original (ver seção
"Design system importado via Claude Design"), que não usava os tokens do
`@theme` de forma consistente. Trocado por tokens em todos os arquivos
citados. Não mexido: `Avatar.tsx` (`text-[10px]/[13px]/[17px]` pro
tamanho das iniciais, acoplado ao tamanho do próprio avatar, não é texto de
corpo) — sinalizado aqui, não decidido unilateralmente que deveria virar
token.

**Validação**: `biome check` limpo (só resta 1 warning pré-existente,
`noImgElement` em `Avatar.tsx`, fora do escopo desta varredura) e
`tsc --noEmit` sem erros. **Não validado visualmente em navegador** — este
ambiente não tem `chromium-cli`/Playwright/Puppeteer instalado, então as
mudanças de layout responsivo (grid stacking, off-canvas sidebar,
bottom-sheet) não foram vistas renderizadas, só revisadas por código. Fica
como próximo passo manual antes de considerar essa varredura 100% fechada.

## Round robin sob carga alta: alternativas consideradas e não implementadas (2026-08-06)

**Contexto**: o mecanismo atual (`roundRobinRepository.getRoundRobinState` —
`SELECT ... FOR UPDATE` na linha única de `RoundRobinState`, dentro da mesma
transaction que cria o `Lead`, ver seção "Modelagem do banco") está correto
e é suficiente pro volume esperado deste teste técnico. Registrado aqui,
depois de revisão com o agente, o que aconteceria sob tráfego muito mais
alto e os dois caminhos de evolução considerados — nenhum implementado,
por não haver pico real a resolver e por contrariar a simplicidade que o
`CLAUDE.md` pede, mas documentado porque demonstra a análise do trade-off,
que é o que este teste avalia.

**O problema em escala**: o `FOR UPDATE` serializa toda criação de lead na
mesma linha (`id = 1`) — sob um pico de submissões simultâneas, cada
transaction concorrente fica na fila esperando a anterior liberar o lock, e
cada uma dessas transactions em espera segura uma conexão do pool aberta.
O risco real não é lentidão gradual, é esgotamento do connection pool sob
uma rajada, o que derruba a aplicação inteira em vez de só deixá-la lenta.

**Alternativa 1 — contador atômico em Redis (`INCR`), dual-write com o
Postgres**: em vez de `SELECT FOR UPDATE` + `UPDATE` no Postgres, o índice
do próximo vendedor seria decidido por um `INCR` atômico em Redis
(operação single-threaded da própria engine, sem lock de linha, ordens de
magnitude mais rápida que a transaction atual), e só depois o Postgres
seria usado pra gravar o `Lead` de forma durável, sem mais precisar de lock
na `RoundRobinState`. Ganho: elimina a fila de transactions presas no
Postgres. Custo: passam a existir duas fontes de verdade (contador no Redis
e leads no Postgres) que podem divergir — reinício do Redis sem
persistência (`AOF`/`RDB`) zera o contador mesmo com leads já gravados;
crash da aplicação entre o `INCR` e o `INSERT` consome um índice sem gerar
lead correspondente. Exigiria uma rotina de reconciliação (ex: resincronizar
o contador a partir de `SELECT count(*) FROM "Lead"` no boot) pra não
desalinhar de vez — complexidade nova pra resolver um problema de
throughput que este projeto não tem.

**Alternativa 2 — fila (QStash) desacoplando ingestão de processamento**:
em vez de criar o `Lead` de forma síncrona dentro da Server Action do
formulário público, a action publicaria a mensagem no QStash e responderia
de imediato; o QStash entrega a mensagem a um webhook com concorrência
configurável (ex: no máximo 5 processando por vez), controlando quantas
transactions tocam o Postgres simultaneamente em vez de deixar um pico
bruto de requests brigar pelo lock ao mesmo tempo. Ganho: protege o pool de
conexões de uma rajada, sem mudar a lógica de round robin em si (o
`FOR UPDATE` continua existindo dentro do worker que processa a fila).
Custo: (a) muda o contrato da UI — `ContactSection` hoje só mostra "Você
está na lista" depois do lead já criado; com fila, a confirmação vira
"recebemos sua solicitação", sem garantia de processamento no momento da
resposta; (b) exige verificação de assinatura (`Upstash-Signature`) no
endpoint que recebe o webhook e uma chave de idempotência, já que o QStash
reentrega em caso de falha/timeout e sem dedupe isso duplicaria o lead;
(c) em produção o QStash precisa de uma URL pública HTTPS pra entregar a
mensagem — pra desenvolvimento local isso não é um bloqueio, porque existe
um servidor de dev local (`npx @upstash/qstash-cli dev`, ou a imagem Docker
`qstash:latest qstash dev`) que simula o serviço inteiro sem tunelamento,
mas ainda seria mais um serviço no `docker-compose` e mais uma peça no
setup documentado no README.

**Decisão**: não implementar nenhuma das duas agora. O `CLAUDE.md` já pede
simplicidade funcional e explicitamente pede confirmação antes de
"introduzir serviços externos pagos ou complexidade desnecessária (ex:
filas, microsserviços)" — não há pico de tráfego real neste teste que
justifique a troca, e o mecanismo atual (`FOR UPDATE` numa única
transaction) já é correto, testado e sobrevive a reinício/redeploy (ver
"Modelagem do banco"). Fica registrado como o caminho de evolução caso o
produto precisasse suportar tráfego real: QStash (Alternativa 2) seria a
escolha preferida sobre o dual-write em Redis (Alternativa 1), porque não
introduz uma segunda fonte de verdade para o índice do round robin — só
controla a taxa de chegada no Postgres, que já é a fonte de verdade única
hoje.

## Rename Skin → Card, e kanban "card" → "LeadCard" (2026-08-06)

**Decisão**: renomear a entidade `Skin` (model Prisma, repository, campos
`skinId`/`skin`, textos de UI) para `Card`, a pedido do usuário — o produto
vendido é chamado de "card" pelo negócio, não "skin".

**Contexto**: o repositório já usava "card" com outro sentido antes desta
mudança — `services/card.service.ts`, `actions/card.actions.ts` e o
componente `KanbanCard` tratam do card do **lead** dentro do quadro kanban
(mover/reordenar entre colunas), sem nenhuma relação com o produto. Renomear
`Skin` para `Card` sem tocar nisso criaria duas coisas diferentes com o
mesmo nome no projeto.

**Sugestão do agente, aceita pelo usuário**: manter `Card` livre só para o
produto (model Prisma, `card.repository.ts`, `cardId` em `Lead`) e
desambiguar o que já existia do kanban, renomeando para `LeadCard`:
`services/card.service.ts` → `services/leadCard.service.ts`
(`cardService` → `leadCardService`), `actions/card.actions.ts` →
`actions/leadCard.actions.ts` (a action exportada `moveLeadAction` já era
suficientemente clara e não mudou de nome) e o componente
`ui/surfaces/KanbanCard.tsx` → `ui/surfaces/LeadCard.tsx` (`KanbanCard` →
`LeadCard`, `KanbanCardProps` → `LeadCardProps`).

## `DATABASE_URL_UNPOOLED` para o Prisma CLI em deploy (2026-08-06)

**Problema**: `npx prisma migrate deploy` no deploy travava com
`P1002 Timed out trying to acquire a postgres advisory lock`. A causa é
`DATABASE_URL` em produção apontar pra uma conexão com pooler (ex:
PgBouncer/Neon/Supabase em modo transaction), que não sustenta lock de
sessão — o Migrate usa `pg_advisory_lock` pra impedir duas migrations
concorrentes, e isso trava/expira através desse tipo de pooler.

**Sugestão do agente, aceita pelo usuário**: `prisma.config.ts` (usado só
pelo Prisma CLI — generate/migrate/studio, nunca pelo runtime da app) passa
a resolver `datasource.url` com fallback:
`process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL`. Em
produção, `DATABASE_URL_UNPOOLED` (conexão direta, sem pooler) precisa
estar configurada no ambiente de deploy — o usuário confirmou que essa
variável já existe lá, só não estava sendo referenciada em lugar nenhum do
projeto. Em dev local (docker-compose) não existe pooler, então a variável
fica de fora do `.env` e cai no fallback pra `DATABASE_URL` sem quebrar
nada. O runtime da app (`src/lib/prisma.ts`) não muda — continua lendo
`DATABASE_URL` (pooled) direto via `pg.Pool`, porque esse arquivo nunca
importa `prisma.config.ts`.

**Nota à parte, não uma decisão de produto**: a skill `prisma-upgrade-v7`
documenta um campo `datasource.directUrl` em `prisma.config.ts` como
alternativa mais idiomática a esse fallback manual, mas o pacote realmente
instalado (`@prisma/config@7.9.1`) não tem esse campo — nem no tipo
(`Datasource` só tem `url`/`shadowDatabaseUrl`) nem no runtime do schema
engine. Por isso foi usado o fallback via `??` em vez de `directUrl`. Vale
reconferir quando a versão do Prisma for atualizada, caso o campo seja
adicionado de fato.
