# Mapeamento de framework: Django/DRF → Next.js (App Router) no Dropbase

Cada seção: o que você faria em Django, o que fazer aqui, e por que a
tradução não é 1:1. Exemplos referenciam arquivos reais do projeto quando
existem.

## 1. Roteamento: `urls.py` → estrutura de pastas

Em Django, toda rota passa por `urls.py`, explícito. Em Next.js App Router, a
URL **é** o caminho do arquivo dentro de `src/app/`:

- `src/app/(public)/page.tsx` → `/`
- `src/app/(dashboard)/dashboard/page.tsx` → `/dashboard`
- `src/app/login/page.tsx` → `/login`
- `src/app/api/auth/[...nextauth]/route.ts` → `/api/auth/*`

`(public)` e `(dashboard)` são "route groups" — parênteses no nome da pasta
**não entram na URL**, servem só pra organizar/aplicar layouts diferentes.
Não existe `include()` de app tipo Django; cada pasta com `page.tsx` já é uma
rota, ponto.

Não há "apps" Django (unidades reutilizáveis e plugáveis). O projeto inteiro é
uma única árvore de rotas.

## 2. Views → Server Components + Server Actions

Isto é a diferença mais estranha vindo de Django, porque Django trata leitura
e escrita na mesma view (`GET` renderiza, `POST` processa e redireciona).
Next.js separa os dois mecanismos:

**Leitura (equivalente a uma view `GET` que renderiza um template)**:
Server Component (`page.tsx` sem `"use client"` no topo). Roda no servidor,
pode fazer `await` direto de uma query Prisma no corpo do componente — não
precisa de `getServerSideProps` nem de endpoint separado.

```tsx
// equivalente a: def dashboard(request): leads = Lead.objects.all(); return render(...)
export default async function DashboardPage() {
  const leads = await leadRepository.listAll();
  return <KanbanBoard leads={leads} />;
}
```

**Escrita (equivalente a uma view `POST` de um form)**: Server Action, função
`"use server"` em `src/actions/*.ts`, chamada diretamente do form via
`action={minhaAction}` ou `useActionState`. Não existe CSRF manual pra
configurar (Next cuida disso), não existe `request.POST.get(...)` — os dados
chegam tipados via `FormData` ou argumento direto.

```ts
// actions/lead.actions.ts — equivalente a uma view que processa o form de contato
"use server";
export async function createLeadAction(prevState, formData: FormData) {
  const parsed = createLeadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten() };
  // ...
}
```

Não existe um "view" único pra GET+POST da mesma URL. Se antes em Django você
tinha uma `FormView` fazendo os dois, aqui é sempre dois arquivos/funções
separados por natureza (leitura no Server Component, escrita na Server
Action) — mesmo que estejam "na mesma tela".

**Quando usar Route Handler (`route.ts`) em vez de Server Action**: só quando
precisa de uma URL HTTP de verdade — webhook externo, endpoint que outro
serviço vai chamar, ou (único caso deste projeto) o handler do NextAuth em
`app/api/auth/[...nextauth]/route.ts`, que **tem** que ser uma rota HTTP
porque é o NextAuth conversando com o browser via redirects OAuth-style. Pra
mutação disparada pelo próprio frontend deste app, Server Action é o padrão —
não crie um Route Handler "porque em Django toda ação tem uma URL". Nesse
projeto especificamente, essa é a **única** rota HTTP fora do App Router
(`CLAUDE.md`, seção "Arquitetura de pastas").

## 3. Server Component vs Client Component

Não tem equivalente direto em Django porque Django não distingue onde o
código roda (sempre servidor; JS no browser é outro mundo, historicamente).
Aqui, todo componente é Server Component **por padrão** — só vira Client
Component com `"use client"` explícito no topo do arquivo.

Regra prática: só adicione `"use client"` quando o componente precisa de
interatividade que só existe no browser — `useState`, `onClick`, drag and
drop (`KanbanBoard.tsx`), `useActionState`/`useFormStatus`. Se o componente só
renderiza dado (ex: `DropsGrid` mostrando skins), mantenha Server Component —
equivalente a um template Django comum, sem JS nenhum rodando no cliente pra
aquilo.

Pense assim: Server Component = HTML gerado no servidor e enviado pronto
(como um template Django renderizado). Client Component = tem um "componente
React vivo" rodando no browser depois, tipo se você tivesse Alpine.js/htmx
anexado num pedaço específico da página, não a página toda.

## 4. ORM: Django ORM → Prisma Client

Sintaxe muda bastante, mas os conceitos batem:

| Django ORM | Prisma | Nota |
|---|---|---|
| `Model.objects.get(id=x)` | `prisma.model.findUniqueOrThrow({ where: { id: x } })` | Prisma não lança por padrão em `findUnique` — retorna `null`. Use `findUniqueOrThrow` só quando ausência é bug, não caso esperado |
| `Model.objects.filter(status=x)` | `prisma.model.findMany({ where: { status: x } })` | — |
| `Model.objects.create(...)` | `prisma.model.create({ data: {...} })` | — |
| `instance.save()` após editar campo | Não existe — sempre `update({ where, data })` explícito | Prisma não tem "instância viva" que rastreia mudanças; é sempre CRUD explícito |
| `Model.objects.select_related("fk")` | `include: { relation: true }` | Resolve o N+1 de foreign key |
| `Model.objects.prefetch_related("m2m")` | `include: { relation: true }` (Prisma decide join vs. query separada internamente) | Você não escolhe a estratégia como em Django; Prisma otimiza sozinho |
| Loop com `.filter()` dentro de um `for` sobre queryset | **Proibido neste projeto** (`CLAUDE.md`) | Exatamente o N+1 que `select_related`/`prefetch_related` evitam em Django — aqui a regra é explícita: nunca `await` de query dentro de loop, usar `findMany`/`updateMany`/`$executeRaw` em lote. Ver `repositories/lead.repository.ts#reorderColumn` |
| Migrations (`makemigrations`/`migrate`) | `prisma migrate dev` / `prisma migrate deploy` | Conceito idêntico, CLI parecida |
| `Model.objects.filter(...).update(status=x)` | `prisma.model.updateMany({ where, data })` | Mesma limitação: um único `data` pra todas as linhas do `where`. Quando cada linha precisa de valor diferente (ex: `position` do kanban), nem Django nem Prisma resolvem com `update()` em massa — aqui o padrão do projeto é `$executeRaw` com `Prisma.sql`, ver a skill `prisma-client-api` pra sintaxe |
| Transação (`transaction.atomic()`) | `prisma.$transaction([...])` ou callback | Mesmo propósito: round robin (`services/lead.service.ts`) roda em transaction pra evitar dois leads simultâneos "roubarem" o mesmo vendedor — igual você faria com `select_for_update()` em Django pra evitar race condition |

Sem "managers" customizados nem `QuerySet` encadeável arbitrário — cada
método do Prisma Client já recebe o filtro completo de uma vez (`where`,
`include`, `orderBy` no mesmo objeto), não dá pra compor `.filter().filter()`
como em Django.

## 5. Validação: Forms/Serializers → zod

`forms.py`/`serializers.py` do Django validam E (às vezes) renderizam campo.
`validators/*.schema.ts` (zod) só valida — não tem "widget" nem renderização
acoplada:

```ts
// validators/lead.schema.ts — equivalente a um Django ModelForm/Serializer
export const createLeadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().transform(normalizePhone),
  skinId: z.string(), // obrigatório, sem .optional()
});
```

Diferença de fluxo: em Django, `form.is_valid()` + `form.errors` no template.
Aqui, `schema.safeParse(data)` retorna `{ success, data }` ou
`{ success: false, error }` — sem exceção lançada por padrão (`.parse()`
lançaria; o projeto usa `.safeParse()` de propósito, pra Server Action
devolver erro estruturado em vez de crashar). O componente de formulário lê
esse resultado via `useActionState`, parecido com re-renderizar o template
com `form.errors` preenchido, mas sem reload de página (é tudo client-side
depois do primeiro submit).

## 6. Auth: `django.contrib.auth` → NextAuth v5

- **Sessão**: Django guarda sessão no banco (tabela `django_session`) por
  padrão. Este projeto usa NextAuth em modo `jwt` — sessão inteira dentro de
  um cookie assinado, sem tabela `Session`. Mais parecido com JWT stateless
  de uma API DRF com `rest_framework_simplejwt` do que com sessão clássica de
  Django.
- **Login único de admin**: não tem `User.objects.create_user` com signup
  público — só existe 1 conta, criada via seed (`prisma/seed.ts`), análogo a
  um `createsuperuser` fixo rodado no deploy, não uma tela de registro.
- **Proteção de rota**: `@login_required` vira duas coisas aqui, não uma —
  isso é uma pegadinha real que já mordeu o projeto (ver
  `docs/DECISOES.md`, seção "Auth em Server Actions"):
  1. `src/proxy.ts` — protege navegação (equivalente a um middleware Django
     tipo `LoginRequiredMiddleware`), mas **não cobre Server Actions**
     porque elas passam pela mesma rota HTTP da página (POST) e o Next trata
     esse header (`next-action`) de forma especial. `proxy.ts` identifica
     esse caso pelo header `next-action` e deixa passar sem redirecionar —
     redirect HTTP cru quebraria o protocolo que o client runtime de Server
     Actions espera.
  2. A action em si precisa reverificar sessão — é o `@login_required`
     real, só que precisa ser aplicado de novo em cada mutação, não uma vez
     só na rota. Como isso é feito mudou com a adoção do `next-safe-action`
     (ver abaixo); a exigência em si (proxy sozinho não garante nada dentro
     de uma action) não mudou.
  Regra prática: toda Server Action nova que mexe em dado protegido
  **precisa** passar pelo `authActionClient` (ou o client base equivalente)
  — o proxy sozinho não garante isso, mesmo que a página que a chama já
  esteja atrás dele.
- **Decorator vs HOF vs client encadeado**: Python tem `@decorator` como
  sintaxe de linguagem — `@login_required` antes de `def view`. TypeScript
  não tem decorator pra função solta (só pra classes, e ainda experimental).
  O projeto passou por duas fases aqui, e vale saber as duas porque a
  primeira ainda aparece no histórico do `docs/DECISOES.md`:
  1. **HOF manual** (abandonada): `withAuth(minhaAction)` envolvia a função
     e retornava outra — o mais próximo, sintaticamente, do decorator
     Python, mas escalava mal (`withAuth(withValidation(schema, fn))`
     aninhado conforme mais actions precisavam de mais de uma
     preocupação).
  2. **`next-safe-action` (atual, `src/lib/safe-action.ts` +
     `src/middlewares/auth.middleware.ts`)**: client encadeado, mais
     parecido com como uma `APIView` do DRF declara
     `permission_classes = [IsAuthenticated]` e `serializer_class = X` como
     atributos de classe do que com decorator de função:
     ```ts
     // src/middlewares/auth.middleware.ts
     export const authActionClient = actionClient.use(async ({ next }) => {
       const session = await auth();
       if (!session?.user) throw new ActionError("Sessão expirada. Faça login novamente.");
       return next({ ctx: { session } });
     });

     // src/actions/card.actions.ts
     export const moveLeadAction = authActionClient
       .inputSchema(moveLeadSchema)   // equivalente a serializer_class
       .action(async ({ parsedInput }) => { /* ... */ });  // equivalente ao method da view
     ```
     `.use()` empilha middlewares (você pode encadear mais de um, cada um
     adicionando contexto via `next({ ctx: {...} })` — parecido com como
     múltiplas classes de permission do DRF são avaliadas em sequência).
     Erros esperados (`ActionError`, ex: sessão ausente) são lançados como
     exceção normal, não `redirect()` — **decisão deliberada**: chamar
     `redirect()` dentro de uma action gerenciada pela lib é um problema
     documentado da própria lib (`redirect() doesn't work inside actions`).
     `handleServerError` em `src/lib/safe-action.ts` centraliza a conversão
     de erro pra mensagem segura de mostrar ao usuário — parecido com um
     `exception_handler` customizado do DRF, um lugar só em vez de
     try/catch espalhado.
  **Escopo real da migração — nem toda action foi migrada, e isso foi
  intencional**: só `card.actions.ts#moveLeadAction` usa
  `next-safe-action` hoje. `lead.actions.ts#createLeadAction` (form
  público da landing) continua com zod manual + `useActionState` no
  formato `(prevState, formData)`, porque depende de progressive
  enhancement (funcionar sem JS) — o hook próprio da lib
  (`useStateAction`) não suporta esse caso. `auth.actions.ts` também não
  foi tocado, por não ter validação de input própria além do que o
  NextAuth já faz. **Não assuma que toda Server Action nova deveria usar
  `next-safe-action` só por consistência** — o critério do projeto é "a
  action precisa compor auth + validação de forma não-trivial", não
  "toda action usa a mesma lib". Se estiver em dúvida sobre qual padrão
  usar numa action nova, pergunte — é exatamente o tipo de escolha que já
  foi feita caso a caso aqui, não por regra fixa.

## 7. Testes: `TestCase`/pytest → Vitest

Django testa view fazendo request de verdade contra um test client
(`self.client.post(url, data)`), inspecionando `response`. Este projeto
**não** testa Server Actions/Server Components subindo o Next — testa a
lógica de negócio isolada, como funções puras:

- `services/lead.service.test.ts` — testa round robin chamando o service
  direto, Prisma mockado (não sobe banco real).
- `actions/lead.actions.test.ts` — testa a Server Action com o *service*
  mockado (não Prisma), porque o objetivo é cobrir validação/roteamento de
  erro da action, não repetir a cobertura do service.

Mais parecido com testar um `service`/`selector` Django isolado do Django
Test Client do que com um teste de view tradicional — o projeto
propositalmente evita testar "a rota" e testa "a regra de negócio", camada
por camada (mesma motivação de separar `services/` de `actions/` no
`CLAUDE.md`).

## 8. `settings.py` → configuração espalhada

Não existe um módulo central de configuração:

- Variáveis de ambiente: `.env` (lido via `process.env`, sem `django-environ`
  — precisa de `dotenv`/`tsx` carregando manualmente em scripts fora do
  runtime do Next, ver `prisma/seed.ts`).
- Config do Next em si (build, `reactCompiler`, etc.): `next.config.ts`.
- Config do Prisma (connection string, provider): `prisma.config.ts` +
  `prisma/schema.prisma` (Prisma 7 tirou a connection string de dentro do
  `.prisma`, ver `docs/DECISOES.md`).
- Config do NextAuth: `src/auth.ts`.

Se for procurar "onde configura X", não existe um arquivo único — é por
responsabilidade.
