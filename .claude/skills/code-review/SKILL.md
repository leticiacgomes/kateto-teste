---
name: code-review
description: Revisão de código no papel de staff engineer, focada em qualidade de código e corretude funcional do Dropbase — captura as mudanças staged/unstaged/untracked do git (ou o projeto inteiro se a árvore estiver limpa) e avalia contra as regras de negócio e convenções do CLAUDE.md/AGENTS.md. Não usa nem expõe nenhum critério de avaliação do processo seletivo. Use sempre que o usuário pedir "/code-review", "revisão antes de commitar", "review completo", "revise como staff engineer", ou antes de um commit importante.
---

# Code Review (Dropbase)

Esta skill existe para substituir uma revisão manual antes de cada commit
importante. Ela não edita código — só relata. Correções são um passo
separado, feito só se pedido depois do review.

Escopo estrito: **qualidade de código e corretude funcional**, medida
contra as regras de negócio e convenções que o próprio repositório já
documenta (`CLAUDE.md`, `AGENTS.md`, `docs/DECISOES.md`). Esta skill nunca
referencia, cita ou reproduz nenhum critério de avaliação, peso de nota ou
texto do processo seletivo — isso não é conteúdo do produto e não deve
influenciar a revisão nem aparecer na saída.

## Passo 1 — Definir o escopo

Rodar em paralelo:

```
git status --porcelain=v1
git diff                 # unstaged, arquivos rastreados
git diff --cached        # staged
```

- **Se houver qualquer coisa staged, unstaged ou untracked relevante**
  (ignorar lockfiles, `generated/prisma`, artefatos de build): o escopo é
  essas mudanças. Ler o diff completo de cada arquivo modificado
  (`git diff HEAD -- <arquivo>`) e o conteúdo integral de arquivos novos
  (untracked) via `Read`.
- **Se a árvore estiver limpa**: o escopo é o projeto inteiro.

Em ambos os casos, ler também antes de revisar:

- `CLAUDE.md` e `AGENTS.md` — convenções e o que o agente pode/não pode
  decidir sozinho.
- `docs/DECISOES.md` — trade-offs já discutidos e conscientemente aceitos;
  não reabrir debate sobre o que já foi decidido aqui.
- `README.md` — pra saber se setup/instruções já existem ou ainda faltam.

## Passo 2 — Checklist de qualidade e corretude funcional

Verificar especificamente (além de qualquer outra coisa que salte aos olhos
no diff/projeto), priorizado por **risco técnico e impacto no
funcionamento real**, não por ordem de descoberta:

**Regra de negócio (round robin)**
- Ordem fixa: Marcelo → Rafael → Renato → Pedro → Leonardo → repete.
- Ponteiro persistido em banco (`RoundRobinState`), não em memória —
  sobrevive a reinício/redeploy.
- Atribuição dentro de uma transaction/lock que evita dois leads roubarem o
  mesmo vendedor sob concorrência.
- Lógica isolada em `services/lead.service.ts`, testável sem subir UI/rota.
- Card do lead mostra qual vendedor ficou responsável.

**Qualidade de código**
- Nenhum `await` de query Prisma dentro de `for`/`.map`/`.forEach` sobre
  lista vinda do banco (regra do `CLAUDE.md` — usar batch/`updateMany`/raw
  em lote). Ver `services/card.service.ts` como referência do padrão
  correto.
- Nomes em inglês, sem `any` evitável, sem abstração introduzida sem
  necessidade real.
- Mutações em Server Actions (`actions/`) chamando `services/` →
  `repositories/`, não lógica de negócio direto em componente/rota.

**Documentação**
- `README.md` cobre stack, estrutura de pastas e como rodar de fato (não é
  boilerplate do scaffold).
- `docs/DECISOES.md` registra decisões estruturais reais, com alternativas
  consideradas e o porquê — não só uma lista de "fizemos X".
- `CLAUDE.md`/`AGENTS.md` batem com o código atual (deriva de doc — lib
  trocada, pasta renomeada, etc. — conta como achado, geralmente baixa
  prioridade mas fácil de corrigir).

**Página pública e kanban**
- Formulário com os campos definidos no projeto (nome, skin/figurinha
  desejada, telefone), validação zod, telefone validado como número
  plausível.
- Kanban com as 4 colunas fixas (Sem Contato, Em Contato, Perdido,
  Finalizado), cards móveis entre elas.

**Fundamentos de produto**
- Autenticação real na área logada, verificada não só na página mas também
  nas Server Actions que mutam dado protegido (checar `node_modules/next/
  dist/docs` se houver dúvida sobre o padrão desta versão do Next, por
  causa do aviso do `AGENTS.md`).
- Validação de input nos dois formulários (contato público, login).
- Erros tratados de forma visível ao usuário, não só logados no servidor.

**Cuidado geral**
- Setup roda de fato com poucos comandos ou `docker compose up` — testar o
  caminho documentado, não só assumir que funciona.
- Histórico de commits legível, pequenos e descritivos.

## Passo 3 — Papel: staff engineer sob prazo curto

- Contexto real: quem está entregando tem poucas horas de trabalho efetivo
  e é a primeira vez com Next.js — julgar com esse contexto, não exigir
  arquitetura de produto maduro.
- Nunca sugerir remover validação "pra simplificar" (regra do `CLAUDE.md`).
- Nunca decidir a regra de round robin sozinho — se achar um problema nela,
  apontar, mas não alterar sem confirmar antes (regra do `CLAUDE.md`).
- Separar claramente **bug real** de **trade-off já justificado** em
  `docs/DECISOES.md` — a segunda categoria vai na seção "não é problema",
  não nos achados.
- Não editar nada durante o review em si; só relatar. Se o usuário pedir
  pra corrigir algo depois, isso é um passo separado.

## Passo 4 — Formato de saída

Seguir a estrutura de `references/example-output.md` (ver ali o exemplo
completo e o porquê de cada parte):

1. Uma frase de contexto (estado geral do repositório).
2. `## O que está muito bem feito (não mexer)` — elogios específicos,
   referenciando arquivo/função.
3. `## Achados, por prioridade` — cada item numerado, com tag
   `[ALTO/MÉDIO/BAIXO — esforço estimado]`, causa raiz em 1-3 frases, e um
   checklist `- [ ]` acionável.
4. `## Não é problema — trade-off já documentado, não mexer`.
5. `## Ordem sugerida se for resolvendo aos poucos`.

Salvar o resultado em `tmp/code-review-<AAAA-MM-DD-HHmm>.md` (pasta já
gitignorada na raiz do projeto — não em `/tmp` do sistema) e apresentar um
resumo direto na conversa. Isso não é um artefato pra versionar no repo.
