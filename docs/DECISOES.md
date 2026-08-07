# Decisões técnicas

Resumo dos pontos principais, o quê e o porquê. O log
completo está em [`DECISOES-COMPLETO.md`](./DECISOES-COMPLETO.md), guardado 
pra eu estudar o projeto com calma depois. 

Todos esses trade offs podem ser um ponto de melhoria nesse projeto.

## Next.js, mesmo não sendo minha stack

Nunca tinha usado Next antes disso. Escolhi mesmo assim porque é o framework
com melhor suporte e conteúdo nos agentes de IA, dado que
ia depender de IA pra acelerar dentro do prazo do teste. Isso pesou mais do
que a curva de aprendizado.

## Devcontainer

Sobe uma imagem Docker já configurada (Node + Postgres) e isola o ambiente
do resto da máquina — qualquer pessoa que abrir o projeto tem exatamente o
mesmo setup, sem depender de versão de Node/Postgres instalada localmente.
Criei também um script para usar o docker compose sem a extensão.

## Postgres

É o banco que tenho mais experiência e familiariade. Docker deixa bem
simples de utilizar.

## pnpm

Guarda o cache dos pacotes de forma global, Instala mais rápido que npm.

## Login único + dashboard simples

Um único usuário admin loga na área logada (NextAuth Credentials), não um
login por vendedor — os 5 representantes existem só como destino do round
robin. Decisão por tempo: modelar auth por vendedor exigiria uma tela de
gestão de usuários que não é o foco do teste. Ver seção "Autenticação" em
[`ARQUITETURA.md`](./ARQUITETURA.md) pra como a sessão é validada em duas
camadas (proxy + Server Action).

## Acoplamento direto entre services e repositories (sem DI) e clean code menos rigoroso

`repositories/` e `services/` são objetos exportados direto (`export const
leadRepository = {...}`) e importados diretamente por quem usa, sem
interface nem injeção de dependência — troca testabilidade/flexibilidade por
menos boilerplate. Decisão consciente pelo tamanho do projeto e prazo: não
justificava a abstração extra. De modo geral o código (principalmente o
front) pode estar mais bagunçado do que eu gostaria, utilizei a IA
pra ganhar velocidade e não tive tempo de revisar/refatorar tudo com calma.

## Server Actions

A principal razão pra escolher o Next.js foi utilizar as server actions que permitem compartilhar os tipos do back e front facilmente, sem precisar escrever nenhum tipo de contrato ou tipos compartilhados. Para organizar as actions utilizei a lib next-safe-action com zod.

## Imagens estáticas, sem bucket

DJs e cards usam `imageUrl` apontando pra arquivo estático em `public/`, não
upload/bucket. Em um projeto real teríamos um CRUD para criar os cards, que
incluiria um upload de imagem para um bucket.

## Exemplo de como usei a IA pra debugar (não só pra gerar código)

Quando testei manualmente deletando o cookie de sessão e movendo um card no
kanban, caiu um erro genérico de client em vez de redirecionar pro login.
Antes de pedir a solução pronta, perguntei pra IA como esse mesmo problema
seria resolvido no Django (minha referência), entender o equivalente
(`@login_required`, middleware) me ajudou a formular a pergunta certa sobre
o equivalente em Next/Server Actions, e só aí pedi a implementação. Log
completo da investigação (por que o `proxy.ts` engolia a resposta da Server
Action antes dela rodar) está em `DECISOES-COMPLETO.md`, seção "Auth em
Server Actions".

## Round robin: `FOR UPDATE`

O fluxo em si (quem chama quem) está em `ARQUITETURA.md`. A decisão aqui é
por que ele trava a linha (`SELECT ... FOR UPDATE` na `RoundRobinState`
dentro da mesma transaction que cria o `Lead`): é o que impede dois
formulários enviados ao mesmo tempo "roubarem" o mesmo vendedor, a segunda
transaction fica bloqueada até a primeira commitar. Suficiente pro volume
esperado. 

Sob tráfego bem mais alto isso vira gargalo (fila de transactions
presas na mesma linha, risco de esgotar o pool de conexões); Possível evolução
seria uso de fila (RabbitMQ, SQS...). Não implementei por não existir esse pico
no momento.

## Evitar N+1 ao reordenar o kanban

Mover um card exige renumerar os outros leads da coluna. A primeira versão
fazia isso com um `UPDATE` por lead dentro de um loop (N+1 de verdade,
apontado por mim numa revisão). Troquei por uma única query
(`$executeRaw`, `UPDATE ... FROM (VALUES ...)`) que atualiza a coluna
inteira de uma vez — virou regra permanente no `CLAUDE.md` ("evitar N+1 a
qualquer custo") porque era um padrão fácil de reintroduzir sem perceber em
qualquer loop novo sobre dado do banco.

Procurei na internet soluções do Jira e Trello por exemplo para ver como seria
uma solução mais escalável e uma das possíveis seria utilizar fractional indexing.

## CI/CD, ambientes e testes de integração — não implementados

Pelo tempo apertado, não implementei CI/CD completo,
separação de ambientes (staging/produção) e testes de integração
(banco real, subindo a aplicação). Ficou só Vitest unitário pra lógica de
round robin e services/actions (mockando Prisma), decisão por conta da priorização. 

## Cloud Design

Utilizei para criar meu design system.