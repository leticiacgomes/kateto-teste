@AGENTS.md

# CLAUDE.md — Dropbase

Este arquivo orienta agentes de IA (Claude Code ou similar) trabalhando neste
repositório. Ele existe porque estou usando Next.js pela primeira vez e estou
me apoiando fortemente em agentes para acelerar o desenvolvimento dentro do
prazo do teste técnico. Transparência sobre isso é intencional — ver
`docs/DECISOES.md` para o racional completo.

## Sobre o projeto

**Dropbase** é uma landing page + CRM simples para venda de figurinhas/cards
de DJs de música eletrônica. Tem duas partes:

1. **Página pública** — vitrine dos DJs/cards + formulário de contato.
2. **Área logada** — kanban de leads com 4 colunas fixas (Sem Contato, Em
   Contato, Perdido, Finalizado), distribuídos automaticamente entre 5
   vendedores em round robin.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + Postgres
- NextAuth (Credentials provider) para a área logada
- @dnd-kit (core/sortable/utilities) para drag-and-drop do kanban
- zod + next-safe-action para validação e Server Actions tipadas
- Vitest para testes da lógica de round robin

Escolhida porque tem o melhor suporte de agentes de IA e documentação
consolidada, compensando minha falta de experiência prévia com o framework.
Ver `docs/DECISOES.md`.

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

## Como o agente deve trabalhar aqui

### Meu papel vs. papel do agente
- **Eu decido**: identidade visual, conceito da landing, regras de negócio,
  estrutura de dados, prioridades de tempo.
- **Agente executa**: escrita de código dentro dessas decisões, sugestões de
  padrões idiomáticos de Next.js/Prisma (que eu não conheço), scaffolding de
  componentes, geração de testes, revisão de código antes de commit.
- Toda sugestão estrutural relevante do agente (ex: mudar abordagem de
  autenticação, trocar biblioteca) é registrada em `docs/DECISOES.md` com
  quem sugeriu e por quê foi aceita/recusada.

### Convenções de código
- TypeScript estrito onde possível; evitar `any`.
- Server Actions para mutações (form de lead, mover card), em `actions/`,
  chamando `services/` que orquestram `repositories/`.
- Lógica de domínio (ex: round robin) vive em `services/`, isolada de
  componentes React e de Server Actions, para ser testável sem renderizar UI
  nem subir nenhuma rota.
- Nomes em inglês, sempre.
- Commits pequenos e descritivos, um por etapa concluída.
- **Evitar N+1 a qualquer custo**: nunca fazer `await` de uma query Prisma
  (`findUnique`, `update`, etc.) dentro de um `for`/`.map`/`.forEach` sobre
  uma lista vinda do banco. Usar sempre uma operação em lote — `findMany`
  com `where: { id: { in: [...] } }`, `updateMany`, `createMany`, ou, quando
  cada linha precisa de um valor diferente (ex: reordenar `position` de uma
  coluna do kanban), uma única query raw (`$executeRaw`/`$queryRaw` com
  `Prisma.sql`/`Prisma.join`) dentro da mesma transaction. Isso vale tanto
  pra `repositories/` quanto pra qualquer loop em `services/` que dispare
  queries. Ver `services/leadCard.service.ts` +
  `repositories/lead.repository.ts#reorderColumn` como referência do
  padrão, e `docs/DECISOES.md` pelo caso que motivou essa regra.

### O que o agente NÃO deve fazer sozinho
- Não decidir a regra de round robin sem confirmar comigo — é o core do
  teste, quero que eu entenda 100% dela.
- Não introduzir serviços externos pagos ou complexidade desnecessária
  (ex: filas, microsserviços) — o teste pede simplicidade funcional.
- Não remover validações para "simplificar".

## Lógica de round robin (crítica)

Ordem fixa: Marcelo → Rafael → Renato → Pedro → Leonardo → (repete).

- Persistida no banco (tabela `RoundRobinState`, ponteiro do próximo índice),
  não em memória — precisa sobreviver a reinícios do servidor/deploys.
- Atribuição roda dentro de uma transaction do Prisma para evitar dois leads
  simultâneos "roubarem" o mesmo vendedor.
- A regra pura (qual o próximo índice) vive em `services/round-robin.service.ts`,
  sem I/O, testada em `tests/unit/round-robin.service.test.ts`. A orquestração
  (ler o ponteiro, contar representantes, gravar o lead, tudo dentro da
  transaction) vive em `services/lead.service.ts`, testada em
  `tests/unit/lead.service.test.ts`.

## Skills / prompts específicos usados

(Preencher conforme for criando durante o desenvolvimento — ex: prompt usado
para gerar o design system da landing, prompt para revisar acessibilidade,
subagente de revisão de código antes de commit, etc.)

- [x] Skill de design de front-end (`.claude/skills/frontend-design/SKILL.md`)
      — mobile-first, acessibilidade, proibição de fetching no client,
      aderência ao design system. Aplicada em toda edição de componente React.
- [x] Skill de revisão de código pré-commit (`.claude/skills/code-review/SKILL.md`)
      — `/code-review` revisa staged/unstaged/untracked (ou o projeto
      inteiro se a árvore estiver limpa) no papel de staff engineer,
      focada puramente em qualidade de código e corretude funcional
      (regras de negócio, N+1, auth, docs) — não usa nem expõe critérios
      do processo seletivo. Ver `docs/DECISOES.md` pelo racional de ter
      escolhido skill em vez de hook do Claude Code.
- [ ] Prompt de geração de testes

## Status / o que falta

Ver `README.md` para instruções de setup e `docs/DECISOES.md` para decisões
técnicas e trade-offs. Itens não concluídos por falta de tempo estão listados
no README com o que seria feito a seguir.
