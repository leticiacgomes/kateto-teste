---
name: frontend-design
description: Regras obrigatórias de front-end do Dropbase — responsividade mobile-first, acessibilidade semântica, proibição de fetching no client e aderência ao design system. Use SEMPRE que for criar ou alterar componentes React em src/components ou src/app (páginas, seções da landing, kanban, formulários). Triggers — "criar componente", "novo componente", "ajustar layout", "landing page", "formulário", "kanban UI", "responsivo", "mobile", "acessibilidade", qualquer edição de .tsx dentro de src/components ou src/app.
---

# Frontend Design (Dropbase)

Estas 4 regras são inegociáveis — valem para **todo** componente React tocado
neste projeto, novo ou existente. Não são sugestões a serem pesadas contra
prazo; se o prazo aperta, o corte é em escopo de feature, não nestas regras.

## 1. Mobile-first, sempre responsivo

- Escreva a classe base (sem prefixo) pensando em mobile primeiro, e adicione
  `sm:`/`md:`/`lg:`/`xl:` do Tailwind só para telas maiores — nunca o
  contrário (base = desktop, `max-*:` para encolher).
- Layouts com `grid-cols-N`, larguras fixas em `px`, ou `flex-row` que só
  fazem sentido em tela larga precisam de uma variante mobile explícita
  (ex: `grid-cols-1 md:grid-cols-2`, não `grid-cols-2` sozinho). Hoje o
  projeto ainda tem componentes assim (ex: `ContactSection.tsx` com
  `grid-cols-2` fixo) — ao tocar em qualquer um desses, corrija sob esta
  regra em vez de só replicar o padrão existente.
- Se a tarefa precisa de um componente que ainda não existe no design system
  (`src/components/ui/*`) para funcionar bem em mobile — um drawer que vira
  bottom-sheet, uma nav que vira menu hamburguer, uma tabela que vira lista
  de cards — **construa o componente**, não pule a responsividade porque
  "não tem um pronto". Coloque em `ui/display`, `ui/forms` ou `ui/surfaces`
  seguindo a mesma estrutura dos existentes.
- Teste mentalmente (ou via devtools) pelo menos três larguras: ~360px
  (mobile), ~768px (tablet), ~1280px+ (desktop). O kanban em particular
  (`components/kanban/*`) precisa de uma estratégia explícita para mobile —
  colunas lado a lado não cabem em 360px, então precisam de scroll
  horizontal por coluna, ou visão empilhada/por-coluna selecionável.

## 2. Acessibilidade é levada a sério

- **HTML semântico** antes de `div`: `<nav>`, `<header>`, `<main>`,
  `<section>`, `<button>` (nunca `<div onClick>` para algo clicável),
  `<ul>/<li>` para listas, heading hierárquico (`h1`→`h2`→`h3` sem pular
  nível).
- **Labels**: todo input precisa de `<label htmlFor>` associado. O padrão já
  existe em `components/ui/forms/Input.tsx` (usa `useId()` para gerar/ligar
  o `id` ao `label` automaticamente) — reuse esse componente em vez de criar
  inputs soltos. Se um campo não pode ter label visível por design, use
  `aria-label`, nunca só `placeholder`.
- **Foco**: todo elemento interativo precisa de estado de foco visível
  (`:focus-visible`), não só `:hover`. Use o token `--color-focus-ring` /
  `border-brand` / `shadow-glow-soft` do design system para o anel de foco,
  seguindo o mesmo padrão que `Input.tsx` já usa em
  `focus-within:border-brand focus-within:shadow-glow-soft`. Nunca remova o
  outline padrão (`outline-none`) sem substituir por um indicador de foco
  equivalente.
- **Contraste**: como o tema é escuro, cuidado especial com `text-fg-faint`
  e `text-fg-muted` sobre `surface-1`/`surface-2` — confirme que texto de
  corpo atinge ~4.5:1 e texto grande/UI ~3:1. Não use cor como único
  diferenciador de estado (ex: `StatusPill.tsx` já faz isso certo — combina
  cor do dot **com** o texto do label; não crie uma badge que só muda de cor
  sem texto/ícone acompanhando).
- Imagens decorativas: `alt=""`. Imagens com conteúdo: `alt` descritivo.
  Ícones SVG que carregam significado (ex: ícone de fechar) precisam de
  `aria-label` no elemento clicável, como em `LeadDrawer.tsx`.

## 3. Nunca fazer fetching no client

Este é um app Next.js (App Router) — dado vem do servidor.

- **Proibido**: `fetch()`, `axios`, `useEffect` + fetch, SWR/React Query
  client-side, ou qualquer chamada de rede dentro de um componente marcado
  `"use client"` ou de um hook usado por ele.
- **Leitura de dados**: acontece em Server Components (`page.tsx` sem
  `"use client"`), que chamam `services/` → `repositories/` (Prisma) e
  passam o resultado como props para componentes client quando precisam de
  interatividade. Nunca um componente client busca seus próprios dados.
- **Mutação de dados**: Server Actions em `actions/*.ts`, chamadas via
  `useActionState` (form) — exatamente o padrão de
  `components/public/ContactSection.tsx` (`createLeadAction`) e
  `components/kanban/KanbanBoard.tsx`. Siga esse padrão para qualquer form
  ou ação novos: componente client só dispara a action e reage a
  `state`/`pending`, nunca monta a própria chamada de rede.
- Se uma tela parece precisar de "recarregar dados depois de uma ação", a
  resposta é revalidação do Server Component (Server Action que faz
  `revalidatePath`/retorna dado atualizado), não um fetch client-side.

## 4. Sempre respeitar o design system do projeto

Fonte da verdade: `src/styles/design-system/styles.css` (tokens dentro de
`@theme`) e os componentes já existentes em `src/components/ui/`.

- **Antes de criar um componente novo**, procure em `ui/display`,
  `ui/forms`, `ui/surfaces` se já existe algo equivalente (`Button`, `Input`,
  `Select`, `Textarea`, `Checkbox`, `Card`, `Badge`, `Tag`, `Avatar`,
  `StatusPill`, `RarityBadge`, `IconButton`) e reuse/estenda em vez de
  duplicar.
- **Cores**: use os aliases semânticos do tema (`bg-surface-1/2/3`,
  `text-fg-strong/body/muted/faint`, `border-line-subtle/default/strong`,
  `bg-brand`, `text-danger`, etc.), nunca hex cru ou `--color-ink-*` direto
  em componentes — os alias semânticos existem justamente para permitir
  retema futuro.
- **Tipografia/espaçamento/radius/shadow**: use os tokens já definidos
  (`text-h1`...`text-micro`, `font-display`/`font-ui`/`font-mono`,
  `rounded-sm`/`rounded-card`, `shadow-glow-magenta`/`shadow-glow-soft`
  etc.) em vez de valores arbitrários (`text-[17px]` só quando realmente não
  há token equivalente).
- **Padrão de variantes**: componentes com variação (tamanho, estilo) seguem
  o padrão `sizeClasses`/`variantClasses` como objeto tipado
  (`keyof typeof`), igual `Button.tsx` e `IconButton.tsx` — não `if/else`
  encadeado.
- **Composição de classes**: sempre via `cn()` de `@/lib/cn`, nunca
  template string manual concatenando classes condicionais.
- Se a tarefa exigir uma decisão de design system que não existe ainda
  (nova cor semântica, novo padrão de componente estrutural), isso é uma
  decisão estrutural — segue a regra do `CLAUDE.md`: perguntar a
  Letícia antes, e registrar em `docs/DECISOES.md`.

## Checklist antes de considerar um componente pronto

- [ ] Funciona em ~360px e em desktop, sem overflow horizontal indesejado
- [ ] HTML semântico; nenhum `<div>`/`<span>` fazendo papel de botão/link
- [ ] Todo input tem label associado (visível ou `aria-label`)
- [ ] Foco visível em todo elemento interativo (teclado, não só mouse)
- [ ] Nenhum `fetch`/chamada de rede dentro de componente/hook client
- [ ] Reusa componentes de `ui/*` e tokens do design system existentes
