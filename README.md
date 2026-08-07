<img src="public/logo.png" alt="Dropbase" width="160" />

# Dropbase

Landing page + CRM simples para venda de figurinhas/cards de DJs de música
eletrônica. Duas partes: vitrine pública com formulário de
contato, e uma área logada com kanban de leads (4 colunas fixas) distribuídos
automaticamente entre 5 vendedores em round robin.

Consulte a documentação do projeto:

- [`CLAUDE.md`](./CLAUDE.md): convenções de código.
- [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md): como front, back, dados, autenticação e distribuição de leads conversam entre si.
- [`docs/DECISOES.md`](./docs/DECISOES.md): racional das decisões técnicas (versão resumida).
- [`docs/DECISOES-COMPLETO.md`](./docs/DECISOES-COMPLETO.md): histórico completo das decisões e debugging.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Prisma ORM + Postgres,
NextAuth (Credentials), @dnd-kit no drag-and-drop do kanban,
zod + next-safe-action nas Server Actions, Vitest.

## Arquitetura de pastas

```
src/
  app/
    page.tsx                    
    login/
      page.tsx                    
    (dashboard)/
      dashboard/
        page.tsx                  
    api/
      auth/[...nextauth]/route.ts
    layout.tsx
    globals.css

  actions/
    lead.actions.ts                
    leadCard.actions.ts            
    auth.actions.ts                

  components/
    public/                       
    kanban/                       
    auth/                         
    ui/                            

  services/
    lead.service.ts              
    round-robin.service.ts        
    leadCard.service.ts           
    auth.service.ts

  repositories/
    lead.repository.ts             
    roundRobin.repository.ts       
    representative.repository.ts
    card.repository.ts
    user.repository.ts

  validators/
    lead.schema.ts                

  lib/
    prisma.ts
    safe-action.ts                
    cn.ts
    format.ts

  middlewares/
    auth.middleware.ts            

  styles/
    design-system/styles.css

  auth.ts                          
  proxy.ts                         

tests/
  unit/                            
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
