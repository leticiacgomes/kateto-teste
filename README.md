# Dropbase

Landing page + CRM simples para venda de figurinhas/cards de DJs de música
eletrônica — teste técnico. Duas partes: vitrine pública com formulário de
contato, e uma área logada com kanban de leads (4 colunas fixas) distribuídos
automaticamente entre 5 vendedores em round robin.

Ver `CLAUDE.md` para as convenções de código, e `docs/DECISOES.md` para o
racional das decisões técnicas e trade-offs considerados.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Prisma ORM + Postgres,
NextAuth (Credentials) na área logada, @dnd-kit no drag-and-drop do kanban,
zod + next-safe-action nas Server Actions, Vitest.

## Arquitetura de pastas

```
src/
  app/
    page.tsx                       # landing pública
    login/
      page.tsx                     # login da área logada
    (dashboard)/
      dashboard/
        page.tsx                   # kanban (protegido por proxy.ts)
    api/
      auth/[...nextauth]/route.ts  # única rota HTTP exigida pelo NextAuth
    layout.tsx
    globals.css

  actions/
    lead.actions.ts                # Server Action: criar lead + round robin
    leadCard.actions.ts            # Server Action: mover card do lead entre colunas
    auth.actions.ts                # Server Action: login

  components/
    public/                        # seções da landing
    kanban/                        # colunas, card do lead, drag context (dnd-kit)
    auth/                          # LoginForm
    ui/                            # design system (display/forms/surfaces)

  services/
    lead.service.ts                # orquestra criação de lead + round robin (transaction)
    round-robin.service.ts         # regra pura do round robin (sem I/O)
    leadCard.service.ts            # mover/reordenar card do lead entre colunas
    auth.service.ts

  repositories/
    lead.repository.ts             # queries Prisma de Lead
    roundRobin.repository.ts       # ponteiro do round robin
    representative.repository.ts
    card.repository.ts
    user.repository.ts

  validators/
    lead.schema.ts                 # validação zod do formulário

  lib/
    prisma.ts
    safe-action.ts                 # wrapper next-safe-action
    cn.ts
    format.ts

  middlewares/
    auth.middleware.ts             # authActionClient p/ Server Actions autenticadas

  styles/
    design-system/styles.css

  auth.ts                          # config do NextAuth (Credentials provider)
  proxy.ts                         # middleware (renomeado nesta versão do Next) — protege /dashboard e /login

tests/
  unit/                            # testes vitest (round-robin, lead, card, auth services/actions)
```

Ver `CLAUDE.md` para as convenções de código que regem essa estrutura (Server
Actions → services → repositories, regra de N+1, etc.).

## Setup

O projeto roda dentro do container `app` do `.devcontainer/docker-compose.yml`
(Postgres + Node). Duas formas de subir:

### Via `dev.sh` (sem precisar do VS Code)

```bash
cp .env.example .env   # ajuste AUTH_SECRET (openssl rand -base64 32)
./dev.sh --setup
```

`--setup` faz tudo: sobe os containers, espera o Postgres ficar pronto,
`pnpm install`, migrations + seed do banco, e sobe o Next.js em
[http://localhost:3000](http://localhost:3000).

Comandos individuais, se precisar rodar passo a passo:

```bash
./dev.sh --up         # sobe db + app em background
./dev.sh --install    # pnpm install dentro do container app
./dev.sh --db:setup   # prisma migrate dev + generate
./dev.sh --seed       # popula DJs/cards + cria o usuário admin
./dev.sh --dev        # sobe o Next.js em http://localhost:3000
./dev.sh --shell      # abre um shell dentro do container app
./dev.sh --down       # derruba os containers
```

### Dentro do VS Code (Dev Containers)

Com a extensão Dev Containers, use "Reopen in Container" — o VS Code sobe o
compose e dá attach automaticamente no `app`. No terminal integrado:

```bash
pnpm install
pnpm db:setup
pnpm db:seed
pnpm dev
```

### Login da área logada

Credenciais definidas em `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env` (usadas
pelo seed para criar o usuário admin). Default se omitidos:
`admin@dropbase.com` / `dropbase123` — ver `.env.example`.

### Testes

```bash
pnpm test   # vitest — lógica de round robin e demais services/actions
```

## Status / o que falta

- `Lead.position` (ordem dos cards dentro de uma coluna do kanban) é um
  `Int` simples, renumerado por inteiro a cada movimentação — funcional para
  o volume esperado, mas o próximo passo seria trocar para fractional
  indexing (`Float`, padrão Trello) pra não tocar em cards não movidos. Ver
  `docs/DECISOES.md`.
- Varredura de responsividade/design system foi revisada por código mas não
  validada visualmente em navegador (sem Chromium disponível neste
  ambiente) — próximo passo manual antes de dar por fechada.
- Round robin sob tráfego alto: mecanismo atual (`SELECT ... FOR UPDATE`)
  é correto para o volume deste teste; alternativas para escala (Redis
  `INCR`, fila via QStash) foram avaliadas e documentadas, não
  implementadas — sem pico real a resolver. Ver `docs/DECISOES.md`.
