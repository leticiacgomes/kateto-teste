# Quando perguntar, quando decidir, quando registrar

Esta skill ajuda a *formular* opções comparando com Django — não muda quem
decide. O `CLAUDE.md` já define isso (seção "Meu papel vs. papel do agente"):
identidade visual, conceito, **regras de negócio** e estrutura de dados são
decisão do usuário; o agente executa dentro disso e sugere padrões idiomáticos
de Next.js/Prisma que o usuário não conhece.

## Três categorias de decisão

**1. Sintaxe/padrão idiomático sem trade-off real** — decida e siga.
Exemplo: usar `??` em vez de `||`, usar `.map`/`.filter` em vez de loop
imperativo, nomear um arquivo `*.schema.ts` seguindo o padrão já usado em
`validators/`. Não precisa perguntar nem registrar — é só a forma "certa" de
escrever o que já foi decidido.

**2. Escolha entre padrões Next.js com trade-off, sem impacto em regra de
negócio** — explique as opções comparando com Django (ver
`framework-mapping.md`) e escolha a mais simples/idiomática, mas **avise o
que foi escolhido e por quê** em vez de decidir silenciosamente. Exemplo:
Server Action vs Route Handler pra uma mutação nova — na dúvida, Server
Action é o padrão do projeto; só usar Route Handler se houver razão concreta
(webhook, endpoint externo).

**3. Decisão estrutural de verdade** — troca de biblioteca, mudança de
abordagem de auth/dado, qualquer coisa que a analogia com Django deixa
tentador "resolver sozinho" porque parece óbvio vindo de lá, mas que muda
comportamento do sistema. **Pergunte antes.** Exemplos reais já registrados
em `docs/DECISOES.md` que ilustram o padrão:

- Round robin: `CLAUDE.md` já é explícito — "Não decidir a regra de round
  robin sem confirmar comigo — é o core do teste". Nunca assumir mudança
  nessa lógica, mesmo que pareça um "detalhe de implementação" analogamente
  simples em Django.
- `next-safe-action` (**implementado**, `src/lib/safe-action.ts` +
  `src/middlewares/auth.middleware.ts`) — bom exemplo de como categoria 3
  costuma chegar aqui: não começou como pedido de troca de lib, começou
  como revisão de um commit (auth em `proxy.ts` sem reverificação nas
  actions), virou uma sequência de perguntas do usuário escalando aos
  poucos (checagem inline → checagem na page? → bug real encontrado
  testando manualmente → centralizar em `withAuth()` → "tem jeito melhor
  de compor isso?"), e só na última pergunta virou de fato "trocar de
  abordagem". A lib só entrou depois de o usuário perguntar explicitamente
  se havia forma melhor de compor middleware + validação — o agente não
  trocou o padrão de HOFs (`withAuth`) sozinho antes disso. Ver
  `docs/DECISOES.md`, seção "Auth em Server Actions: do check isolado no
  `proxy.ts` a `next-safe-action`", pra sequência completa.
  **Detalhe que vale carregar pra próximas decisões parecidas**: a
  migração não virou "trocar todas as actions pra essa lib" — só
  `card.actions.ts` foi migrada, porque só ali existia o problema real
  (compor auth + validação). `lead.actions.ts` (form público, precisa de
  progressive enhancement) e `auth.actions.ts` (sem validação própria)
  ficaram como estavam, de propósito. Decisão estrutural aceita não
  significa aplicar a mudança em tudo que "poderia" usar o padrão novo —
  o critério é o problema que motivou a decisão, não consistência por si
  só. Ver `framework-mapping.md`, seção 6, pro detalhe técnico.
- Troca de `@hello-pangea/dnd` por `@dnd-kit` — decisão do usuário, não
  sugestão aceita do agente; registrada mesmo assim porque muda uma
  dependência estrutural.

Regra prática: se a mudança altera **qual dependência o projeto usa**,
**onde uma regra de negócio mora**, ou **o contrato entre camadas**
(actions/services/repositories), trate como categoria 3 — mesmo que a
"resposta óbvia" pareça clara pela experiência em Django. A experiência em
Django ajuda a *avaliar* a sugestão mais rápido, não a pular a confirmação.

## O que registrar em `docs/DECISOES.md`

Sempre que uma sugestão estrutural for aceita (ou recusada) — categoria 3
acima. Formato já estabelecido no arquivo: título com data, contexto de por
que surgiu, o que foi decidido, e o racional. Ao usar esta skill pra propor
algo comparando com Django, se a sugestão for aceita, inclua no registro *que
o ponto de partida foi a analogia com Django* quando isso explicar o "porquê"
— ajuda releitura futura a entender que a escolha não foi arbitrária nem só
"seguir o hype de Next.js", mas avaliada contra o que o usuário já confiava
funcionar em produção noutro stack.

Não registrar categoria 1 (sintaxe) nem toda categoria 2 (padrão idiomático
sem impacto) — o arquivo já é longo; registrar demais dilui o que realmente
importa revisitar depois.
