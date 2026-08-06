#!/usr/bin/env bash
# Wrapper pra rodar comandos dentro do container `app` do devcontainer
# a partir do host, sem precisar dar attach no VS Code.
#
# O container `app` fica de pé com `sleep infinity` (tooling do devcontainer),
# entao os comandos precisam ser executados via `docker compose exec`.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$ROOT_DIR/.devcontainer"
WORKDIR="/workspaces/$(basename "$ROOT_DIR")"

compose() {
  docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_DIR/docker-compose.yml" "$@"
}

run() {
  compose exec --workdir "$WORKDIR" app "$@"
}

wait_for_db() {
  echo "Aguardando o Postgres ficar pronto..."
  for _ in $(seq 1 30); do
    if compose exec db pg_isready -U postgres >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Timeout esperando o Postgres subir." >&2
  exit 1
}

usage() {
  cat <<EOF
Uso: ./dev.sh <comando>

  --setup       Faz tudo do zero: up, install, db:setup, seed e dev
  --up          Sobe db + app em background (docker compose up -d)
  --down        Derruba os containers
  --install     pnpm install dentro do container app
  --db:setup    prisma migrate dev + generate dentro do container app
  --seed        pnpm db:seed dentro do container app
  --dev         pnpm dev dentro do container app (http://localhost:3000)
  --shell       abre um shell dentro do container app
EOF
}

[ $# -eq 0 ] && { usage; exit 1; }

case "$1" in
  --setup)
    compose up -d
    wait_for_db
    run pnpm install
    run pnpm db:setup
    run pnpm db:seed
    run pnpm dev
    ;;
  --up) compose up -d ;;
  --down) compose down ;;
  --install) run pnpm install ;;
  --db:setup) run pnpm db:setup ;;
  --seed) run pnpm db:seed ;;
  --dev) run pnpm dev ;;
  --shell) compose exec --workdir "$WORKDIR" app bash ;;
  *) usage; exit 1 ;;
esac
