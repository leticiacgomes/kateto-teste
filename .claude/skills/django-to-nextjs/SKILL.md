---
name: django-to-nextjs
description: Ponte de decisão entre background em Python/Django e o stack deste projeto (Next.js App Router + TypeScript + Prisma + NextAuth + Server Actions). Use sempre que for implementar algo novo no Dropbase — nova rota, mutação, validação, query, auth, teste — para escolher a ferramenta/padrão certo e entender o "porquê" comparando com o equivalente Django/DRF que o usuário já conhece. Triggers: "como eu faria isso em Django", "qual a diferença pra Python", "implementar [feature nova]", "Server Action vs API route", "Server Component vs Client Component", dúvidas de sintaxe TS/async, "ORM equivalente", "isso é tipo o [conceito Django]?".
---

# Django/Python → Next.js/TS (Dropbase)

O usuário (Letícia) tem background sólido em Python/Django e está construindo
este projeto (`CLAUDE.md`) em Next.js pela primeira vez, sob prazo curto. Esta
skill existe pra acelerar decisões traduzindo o problema pro vocabulário que
ele já domina, **não** pra decidir por ele — arquitetura e regra de negócio
continuam sendo decisão do usuário, conforme a seção "Meu papel vs. papel do
agente" do `CLAUDE.md`.

## Como usar isto

1. **Antes de implementar algo novo**, identifique o equivalente Django/DRF
   mais próximo (ver `references/framework-mapping.md`) e diga isso
   explicitamente ao usuário em 1-2 frases antes de escrever código — ex:
   "Server Action aqui é o equivalente a uma view do Django que só processa
   POST de um form, sem endpoint GET". Isso ancora a explicação em algo que
   ele já sabe avaliar, em vez de pedir confiança cega num padrão novo.
2. **Quando houver mais de uma forma idiomática de fazer algo em Next.js**
   (Server Action vs Route Handler, Server Component vs Client Component,
   `fetch` cache vs Prisma direto, etc.), apresente o trade-off nesses termos
   — não só "o padrão do Next.js é X", mas "X aqui, porque o equivalente do
   que você faria em Django (Y) não existe/não se aplica da mesma forma
   nesse framework, por causa de Z".
3. **Dúvida de sintaxe pontual** (comprehension, async, decorator, tipos) →
   `references/syntax.md`, cheatsheet lado a lado Python/TypeScript.
4. **Decisão estrutural** (trocar lib, mudar abordagem de auth, escolher
   estratégia de dado) segue a regra que já existe no `CLAUDE.md`: registrar
   em `docs/DECISOES.md` quem sugeriu e por quê foi aceita/recusada. Esta
   skill ajuda a *formular* a sugestão comparando com Django — não substitui
   esse registro. Ver `references/decision-framework.md` para o checklist do
   que vale a pena logar.
5. **Antes de assumir que algo "não existe" ou "é impossível" em Next.js**
   só porque não tem equivalente direto em Django, confira
   `node_modules/next/dist/docs/` primeiro (regra do `AGENTS.md` — esta
   versão do Next tem convenções fora do treinamento padrão, ex:
   `middleware.ts` → `proxy.ts`, documentado em `docs/DECISOES.md`).

## Mapeamento rápido (visão geral)

| Django/DRF | Next.js/Dropbase | Nota |
|---|---|---|
| `views.py` (function/class-based view) | Server Component (`page.tsx`) para leitura, Server Action (`actions/*.ts`) para mutação | Não existe um "view" único que trata GET+POST; são mecanismos separados |
| `urls.py` | Convenção de arquivos em `app/` (roteamento por pasta) | Sem arquivo central de rotas — a URL é a estrutura de diretórios |
| `models.py` (Django ORM) | `prisma/schema.prisma` + Prisma Client | Migrations, mas sintaxe de query bem diferente — ver `references/framework-mapping.md` |
| `forms.py` / DRF `Serializer` | `validators/*.schema.ts` (zod) | Validação declarativa parecida, mas sem binding automático a `<form>` — usa `useActionState` (ou `.inputSchema()` do `next-safe-action` nas actions já migradas) |
| DRF `APIView` com `permission_classes` + `serializer_class` | `authActionClient` (`src/middlewares/auth.middleware.ts`, via `next-safe-action`) — `.use(authCheck).inputSchema(schema).action(fn)` | Composição declarativa em cadeia, não HOFs aninhadas — ver nota abaixo. **Só nas actions migradas** (`card.actions.ts`); `lead.actions.ts`/`auth.actions.ts` ainda usam zod manual, de propósito, ver `framework-mapping.md` |
| Django admin | Não existe equivalente — não faz parte do escopo | Catálogo é seed fixo (`prisma/seed.ts`), sem CRUD admin |
| `django.contrib.auth` + sessions | NextAuth v5 (Credentials, JWT) | Sem tabela `Session` — sessão vive só no JWT assinado |
| `select_related`/`prefetch_related` | `include`/`select` do Prisma, ou batch query manual | Ver a regra anti-N+1 do `CLAUDE.md` — é o mesmo problema, solução com sintaxe diferente |
| `manage.py test` / pytest | Vitest (`tests/unit/`) | Sem test client de request/response — Server Actions e services são testados como funções puras |
| `settings.py` | `next.config.ts` + `.env` + `prisma.config.ts` | Configuração espalhada em vários arquivos por responsabilidade, não um módulo único |
| Celery / management commands | Não usado neste projeto | `CLAUDE.md` proíbe introduzir filas/microsserviços — manter simples |

Detalhes, exemplos de código lado a lado e os "porquês" de cada linha estão em
`references/framework-mapping.md`. Sintaxe pura de linguagem (não framework)
está em `references/syntax.md`.

## Regra de ouro

Quando a tradução Django → Next.js não for óbvia (ex: onde colocar lógica que
em Django seria um `clean()` de form, ou um `signal`), **pergunte ao usuário
o que ele espera antes de escolher um padrão novo** em vez de assumir — é
exatamente o tipo de decisão estrutural que o `CLAUDE.md` pede pra confirmar,
e errar a analogia aqui custa mais caro do que perguntar.
