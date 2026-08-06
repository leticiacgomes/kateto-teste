---
name: code-review
description: Revisão de código abrangente no papel de engenheiro de software sênior/staff — aponta bugs, code smells, problemas de escala/performance, concorrência, segurança e design em qualquer nível do código do Dropbase, usando CLAUDE.md/AGENTS.md/docs/DECISOES.md como contexto para ponderar prioridades e trade-offs (não como checklist fechado). Não usa nem expõe nenhum critério de avaliação do processo seletivo. Use sempre que o usuário pedir "/code-review", "revisão antes de commitar", "review completo", "revise como staff engineer", ou antes de um commit importante.
---

# Code Review (Dropbase)

Substitui uma revisão manual antes de commit importante. Não edita código —
só relata; correção é passo separado, só se pedido depois.

Revisar como um **engenheiro sênior/staff** revisaria qualquer PR: olhar
crítico e amplo, não uma lista fixa de itens do projeto. `CLAUDE.md`,
`AGENTS.md` e `docs/DECISOES.md` entram como **contexto pra ponderar
trade-offs** (o que já foi decidido conscientemente, restrições reais como
prazo curto e primeira vez com Next.js, regras de negócio a respeitar) —
não como escopo que limita o que vale revisar. Qualquer bug, code smell,
risco de escala/concorrência/segurança ou decisão de design questionável é
achado, documentado no projeto ou não. Nunca referenciar, citar ou
reproduzir critério de avaliação do processo seletivo.

## Passo 1 — Escopo

Rodar em paralelo: `git status --porcelain=v1`, `git diff`, `git diff --cached`.

- Se houver staged/unstaged/untracked relevante (ignorar lockfiles,
  `generated/prisma`, build): escopo é essas mudanças — ler diff completo
  de cada arquivo modificado e conteúdo integral dos novos.
- Se a árvore estiver limpa: escopo é o projeto inteiro.

Ler antes de revisar: `CLAUDE.md`, `AGENTS.md` (convenções, o que o agente
não decide sozinho), `docs/DECISOES.md` (não reabrir debate do que já foi
decidido), `README.md` (o que já existe vs. falta).

## Passo 2 — Lentes da revisão

Não é checklist pra marcar item a item — são as lentes que um staff
engineer aplica a qualquer diff. Reportar só achado real; priorizar por
**risco técnico e impacto real**, não por ordem de descoberta.

- **Corretude/bugs**: casos de borda (vazio, nulo, zero/negativo), estado
  inconsistente (UI otimista sem rollback, cache não invalidado), erro
  engolido silenciosamente.
- **Code smell/manutenibilidade**: duplicação, abstração sem necessidade
  (regra do `CLAUDE.md`), nome que esconde intenção, inconsistência com
  padrão já estabelecido no projeto.
- **Escala/performance**: N+1 de Prisma — nenhum `await` de query dentro de
  `for`/`.map`/`.forEach` sobre lista do banco; usar batch/raw em lote na
  mesma transaction (ver `services/card.service.ts` +
  `repositories/lead.repository.ts#reorderColumn`). Também: operação sem
  limite de volume, trabalho bloqueante em caminho quente.
- **Concorrência/integridade**: race condition em leitura-modificação-
  escrita sem lock/transaction — inclui o round robin (ordem fixa Marcelo →
  Rafael → Renato → Pedro → Leonardo → repete, ponteiro em
  `RoundRobinState`, transaction evitando dois leads roubarem o mesmo
  vendedor).
- **Segurança**: auth/autorização em todo caminho que muta dado protegido
  (Server Actions inclusas, não só página — checar `node_modules/next/
  dist/docs` se houver dúvida por causa do `AGENTS.md`); validação em toda
  fronteira, nunca removida "pra simplificar"; dado sensível vazando em
  log/erro exposto.
- **Testes**: lógica crítica testável sem UI/rota, cobertura além do
  caminho feliz, teste que não falharia se a lógica quebrasse.
- **Documentação/deriva**: README cobre stack/pastas/como rodar de fato;
  `docs/DECISOES.md` registra alternativas e porquê; `CLAUDE.md`/`AGENTS.md`
  batendo com o código atual; commits legíveis.

## Passo 3 — Postura

- Julgar com o contexto real (poucas horas, primeira vez com Next.js), sem
  exigir arquitetura de produto maduro.
- Nunca sugerir remover validação "pra simplificar"; nunca decidir a regra
  de round robin sozinho — apontar problema, não alterar sem confirmar
  (ambos regra do `CLAUDE.md`).
- Separar **bug real** de **trade-off já justificado** em
  `docs/DECISOES.md` — a segunda vai em "não é problema".
- Não editar nada durante o review; só relatar.

## Passo 4 — Saída

Seguir `references/example-output.md`:

1. Uma frase de contexto (estado geral do repo).
2. `## O que está muito bem feito (não mexer)` — elogios específicos, com
   arquivo/função.
3. `## Achados, por prioridade` — numerado, tag
   `[ALTO/MÉDIO/BAIXO — esforço | dimensão]` (bug, code smell, escala,
   concorrência, segurança, teste, doc), causa raiz em 1-3 frases,
   checklist `- [ ]` acionável.
4. `## Não é problema — trade-off já documentado, não mexer`.
5. `## Ordem sugerida se for resolvendo aos poucos`.

Salvar em `tmp/code-review-<AAAA-MM-DD-HHmm>.md` (gitignorada, não `/tmp`
do sistema) e apresentar resumo direto na conversa. Não é artefato pra
versionar.
