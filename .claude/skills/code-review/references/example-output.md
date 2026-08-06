# Exemplo de saída esperada (tom e nível de detalhe)

Este é um review real gerado seguindo o formato desta skill. Serve como
calibração de tom, granularidade e nível de detalhe — não como conteúdo a
repetir (o projeto muda a cada review).

```markdown
# Review — Dropbase (staff engineer, 2026-08-06)

Contexto: prazo de entrega é hoje (06/08), <2 dias de trabalho. Itens ranqueados por ROI, não por ordem de descoberta.

## O que está muito bem feito (não mexer)

- **Round robin correto de verdade.** `roundRobinService.computeNextIndex` é função pura testada `(currentIndex + 1) % total`. Persistência usa `SELECT ... FOR UPDATE` dentro de transaction (`roundRobinRepository.getRoundRobinState`) antes de avançar o ponteiro — trava a linha certa contra concorrência real. Testes cobrem avanço, wraparound (Leonardo→Marcelo) e documentam honestamente que concorrência de verdade precisaria de teste de integração contra Postgres real, não mock.
- **N+1 do kanban resolvido.** `reorderColumn` faz um único `UPDATE ... FROM (VALUES ...)` em vez de update por linha. Teste (`card.service.test.ts`) verifica explicitamente que `lead.update` **nunca** é chamado — regressão real contra o padrão N+1 voltar.
- **Auth em profundidade real.** Sequência proxy → check na Server Action → `next-safe-action` (`authActionClient`) é a evolução correta (página protegida não cobre Server Actions, confirmado na doc local do Next). `FrameworkErrorHandler` da lib repassa `NEXT_REDIRECT` corretamente — login redirect funciona mesmo dentro do wrapper de erro.
- **`docs/DECISOES.md` é o diferencial do projeto.** Datado, "sugestão do agente" vs "decisão do usuário" separadas, bugs reais com causa-raiz (extensão `.js` quebrando no Turbopack, hydration mismatch do dnd-kit, `setState` durante render).

## Achados, por prioridade

### 1. [ALTO — ~30min, maior ROI] README ainda é boilerplate do `create-next-app`
Zero instrução de setup, stack ou estrutura de pastas. A Parte 1.1 do teste pede README com isso explicitamente, e também entra em "Cuidado geral" (facilidade de rodar).

- [ ] Escrever README.md: stack, estrutura de pastas, como rodar (env, docker, migrate, seed, dev)

### 2. [MÉDIO] Não há `docker compose up` que suba a stack sozinha
`.devcontainer/docker-compose.yml` existe, mas o serviço `app` só roda `sleep infinity` — é tooling do devcontainer, não algo rodável fora do VS Code.

- [ ] Documentar no README: subir só o `db` desse compose (ou criar um compose novo) + `pnpm install` + `prisma migrate deploy` + `db:seed` + `pnpm dev`

### 3. [MÉDIO] `KanbanBoard` não resincroniza com o servidor após o mount
`useState(initialLeads)` só é lido na primeira renderização. Quando `moveLeadAction` falha (ex: sessão expirada no meio do drag), o card fica visualmente na coluna nova mesmo com o `UPDATE` rejeitado no banco — `moveState.serverError` aparece como banner mas nada reverte o estado local. Mesma causa faz uma segunda aba não ver moves feitos em outra sem reload completo.

- [ ] Sincronizar `KanbanBoard` com o prop `leads` (via `useEffect` no prop, ou reverter estado local quando `moveState.serverError` aparecer)

### 4. [BAIXO] Deriva de doc no `CLAUDE.md`
- [ ] Trocar `@hello-pangea/dnd` por `@dnd-kit` na seção Stack (já trocado no código, só falta o doc)
- [ ] Corrigir árvore de pastas: página pública é `src/app/page.tsx`, não `(public)/page.tsx`; falta mencionar `src/app/login/page.tsx`

## Não é problema — trade-off já documentado, não mexer

- `Lead.position` como `Int` (renumeração O(n) em vez de fractional indexing): decisão consciente, volume esperado é baixo, plano de migração futura já registrado.
- Check de auth só no proxy + Server Action, não replicado na page: discutido com o usuário, razoável pra uma única rota protegida.
- `next-safe-action` só em `card.actions.ts`, não em `lead.actions.ts`/`auth.actions.ts`: escopo justificado, não migrado "só por consistência".

## Ordem sugerida se for resolvendo aos poucos

1. README (#1)
2. Instrução de docker/poucos comandos (#2)
3. Fix do rollback do Kanban (#3) — se sobrar tempo
4. Sync do `CLAUDE.md` (#4) — polish final
```

## O que copiar deste exemplo

- **Uma frase de contexto** no topo (prazo, quanto já foi feito) — orienta o
  quão rigoroso ser.
- **Elogios específicos com referência de código** (`arquivo#função`), não
  genéricos ("bom trabalho!").
- **Achados com tag de prioridade e esforço estimado**, não uma lista plana.
  `[ALTO/MÉDIO/BAIXO — esforço]`.
- **Causa raiz em 1-3 frases**, não um parágrafo. Se precisar de mais que
  isso, provavelmente é achado grande demais — quebrar em dois.
- **Checklist acionável** (`- [ ]`) por achado, verbo no infinitivo,
  referência de arquivo/função quando fizer sentido.
- **Separação explícita de trade-offs já decididos** — não reabrir debate
  sobre algo que `docs/DECISOES.md` já justificou conscientemente.
- **Ordem sugerida no final**, pensando em ROI sob prazo apertado, não em
  ordem de descoberta.
