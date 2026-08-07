# Arquitetura

## Visão geral

Um app Next.js, duas superfícies (pública `/` sem auth, `/dashboard` atrás
de NextAuth), mesmo Postgres via Prisma. Toda mutação segue a mesma cadeia,
numa direção:

```
Componente ──▶ Server Action (zod [+ sessão]) ──▶ Service (regra de negócio,
  transaction quando precisa de atomicidade) ──▶ Repository (só aqui fala
  Prisma) ──▶ Postgres
```

## Front-end

Server Components por padrão (landing e kanban buscam dado direto no
servidor, sem fetch no client). Client Component só onde tem estado de
browser: form de contato (`useActionState`) e o board (`@dnd-kit`). Mutação
sempre por Server Action — a única API route é a que o NextAuth exige.

## Autenticação

NextAuth v5 Credentials, sessão JWT, um único admin. 
Duas checagens independentes para que navegação e server actions tenham
seus erros tratados corretamente.

```
GET /dashboard        → proxy.ts checa sessão → redirect /login se ausente
Server Action (mover  → proxy.ts deixa passar (header next-action)
  card)                  → authActionClient checa sessão de novo → erro
                            tipado ("Sessão expirada") se ausente
```

## Server Actions

A principal razão pra escolher o Next.js foi utilizar server actions que permitem
compartilhar os tipos do back e front facilmente, sem precisar escrever nenhum tipo de
contrato ou tipos compartilhados. Para organizar as actions utilizei as
libs `next-safe-action` com `zod` para validação.

## Dados

```
Dj 1───* Card 1───* Lead *───1 Representative
                      │
                      └── status (enum, 4 colunas) + position (Int)
```

`Lead.position` é `Int` simples — mover um card renumera a coluna inteira.
`RoundRobinState` é uma tabela de 1 linha só,
o ponteiro do round robin, persistido pra sobreviver a redeploy.

## Distribuição de leads (round robin)

Ordem fixa: Marcelo → Rafael → Renato → Pedro → Leonardo → repete. Tudo
numa transaction (`lead.service.ts`):

```
SELECT ... FOR UPDATE na linha do RoundRobinState
  → lê nextIndex → acha o Representative
  → computeNextIndex()
  → UPDATE RoundRobinState + INSERT do Lead
```