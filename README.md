# Dropbase

Landing page + CRM simples para venda de figurinhas/skins de DJs de música
eletrônica — teste técnico. Duas partes: vitrine pública com formulário de
contato, e uma área logada com kanban de leads (4 colunas fixas) distribuídos
automaticamente entre 5 vendedores em round robin.

Ver `CLAUDE.md` para a arquitetura de pastas e convenções de código, e
`docs/DECISOES.md` para o racional das decisões técnicas e trade-offs
considerados.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Prisma ORM + Postgres,
NextAuth (Credentials) na área logada, Vitest.

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
./dev.sh --seed       # popula DJs/skins + cria o usuário admin
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
