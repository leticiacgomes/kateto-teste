# Sintaxe: Python → TypeScript, lado a lado

Cheatsheet de linguagem pura (não framework — isso está em
`framework-mapping.md`). Foco no que costuma travar quem vem de Python.

## Tipos e estruturas de dado

| Python | TypeScript | Nota |
|---|---|---|
| `dict` | `object` / `Record<K, V>` / `Map` | `object` literal (`{ a: 1 }`) é o mais comum; `Map` só quando precisa de chaves não-string ou iteração garantida em ordem de inserção (objetos já garantem isso desde ES2015 pra chaves string, então `Map` é raro na prática) |
| `list` | `Array<T>` / `T[]` | `T[]` é a forma idiomática mais comum |
| `tuple` | `[T, U]` (tuple type) | TS tem tuplas tipadas de tamanho fixo, mas é sintaxe de array — `const par: [string, number] = ["a", 1]` |
| `set` | `Set<T>` | Existe nativamente, uso parecido |
| `None` | `null` **e** `undefined` (dois valores, não um) | `undefined` = variável declarada sem valor / propriedade ausente. `null` = ausência explícita. Prisma retorna `null` (não `undefined`) pra campo vazio no banco. Zod usa `.optional()` pra permitir `undefined`, `.nullable()` pra permitir `null` — não são a mesma coisa e dá pra precisar dos dois |
| `f"{nome}"` | `` `${nome}` `` (template literal) | Crase, não aspas |
| `dataclass` / `NamedTuple` | `interface`/`type` (só tipo, sem runtime) ou `class` (com runtime) | `interface`/`type` somem na compilação — não existem em runtime, diferente de `dataclass` |

## Comprehensions e iteração

| Python | TypeScript |
|---|---|
| `[x.name for x in leads]` | `leads.map(x => x.name)` |
| `[x for x in leads if x.status == "won"]` | `leads.filter(x => x.status === "won")` |
| `[f(x) for x in leads if cond(x)]` | `leads.filter(cond).map(f)` |
| `sum(x.value for x in leads)` | `leads.reduce((acc, x) => acc + x.value, 0)` |
| `{x.id: x for x in leads}` (dict comprehension) | `Object.fromEntries(leads.map(x => [x.id, x]))` ou `new Map(leads.map(x => [x.id, x]))` |
| `any(x.won for x in leads)` | `leads.some(x => x.won)` |
| `all(x.won for x in leads)` | `leads.every(x => x.won)` |
| `for i, x in enumerate(leads)` | `leads.forEach((x, i) => ...)` ou `for (const [i, x] of leads.entries())` |

Não existe comprehension como sintaxe própria em TS/JS — é sempre método
encadeado (`.map`/`.filter`/`.reduce`) ou `for...of`. `===` (comparação
estrita) é o padrão a usar sempre, não `==` — igual a `is` vs `==` em Python
mas invertido: em JS, `==` é o "perigoso" (faz coerção de tipo), `===` é o
seguro.

## Async

| Python (`asyncio`) | TypeScript |
|---|---|
| `async def f(): ...` | `async function f() { ... }` / `const f = async () => { ... }` |
| `await algo()` | `await algo()` | Igual na superfície |
| `asyncio.gather(a(), b())` | `Promise.all([a(), b()])` |
| Rodar sync dentro de async exige `run_in_executor` | Não existe distinção sync/async de runtime — JS é single-threaded com event loop; `await` só "pausa" a função, não bloqueia a thread |

Diferença de mentalidade: em Python, código síncrono e assíncrono são dois
mundos que precisam de ponte explícita. Em JS/TS, quase tudo relevante a I/O
(fetch, Prisma) já é assíncrono por padrão, e não tem "modo sync" alternativo
pra essas operações — não existe um `requests.get()` síncrono equivalente
rodando no mesmo processo.

## Decorators vs Higher-Order Functions

Python tem decorator como açúcar sintático de linguagem:

```python
@login_required
def minha_view(request): ...
```

TypeScript **não tem** decorator pra função solta (só pra classes, e ainda é
recurso experimental/stage do TC39, não usado neste projeto). O equivalente é
sempre envolver a função manualmente — Higher-Order Function:

```ts
// não existe "@withAuth" antes de uma function solta
export const minhaAction = withAuth(async (session, ...args) => {
  // ...
});
```

`withAuth` (`src/middlewares/auth.middleware.ts`) recebe uma função e
**retorna outra função** que faz a checagem antes de chamar a original —
mesmo efeito prático do decorator Django, sintaxe diferente (chamada de
função em vez de anotação `@`).

## Null-safety e optional chaining

| Python | TypeScript |
|---|---|
| `getattr(obj, "attr", None)` / `obj.attr if obj else None` | `obj?.attr` (optional chaining) |
| `valor or padrao` | `valor ?? padrao` (nullish coalescing — cuidado: `||` também existe mas trata `0`/`""` como falsy, `??` só trata `null`/`undefined`) |
| `if obj is not None:` | `if (obj != null)` (pega `null` e `undefined` juntos) ou `if (obj !== null && obj !== undefined)` |

`??` quase sempre é o certo em vez de `||` quando o valor pode legitimamente
ser `0`, `""` ou `false` — `0 || 10` dá `10` (bug comum), `0 ?? 10` dá `0`
(correto).

## Módulos

| Python | TypeScript |
|---|---|
| `from x.y import z` | `import { z } from "./x/y"` |
| `import x` | `import * as x from "./x"` |
| `if __name__ == "__main__":` | Não existe equivalente direto — scripts standalone (`prisma/seed.ts`) rodam via `tsx` diretamente, sem guard de "é o módulo principal?" |

## Type hints vs TypeScript

Type hints em Python são opcionais e não verificados em runtime por padrão
(`mypy` é ferramenta separada, não roda automaticamente). TypeScript é
verificado em **build time** pelo `tsc`, mas também **some** completamente em
runtime — um `as string` ou um tipo errado não lança erro em produção, só o
compilador reclama antes. Não confundir tipo TS com validação real: dado que
vem de fora (`FormData`, resposta de API, banco antes de tipar) precisa de
validação em runtime de verdade (zod) — TS sozinho não protege contra dado
malformado em tempo de execução, é só contrato em tempo de compilação.
