#!/usr/bin/env bash
# Deploy one API image to this server (AD §12.4). Run on the server as the deploy user, by
# infra/ansible (first install) and by .github/workflows/deploy-staging.yml (every merge to main):
#   /srv/skipa/compose/deploy.sh ghcr.io/<owner>/skipa-api:<git-sha> [--seed]
# Steps: pull → start Postgres → migrate → (seed) → start everything → smoke test through Caddy.
# Rollback: run it again with the previous image (migrations are expand/contract, brief §7).
set -euo pipefail

image="${1:?usage: deploy.sh <image> [--seed]}"
seed="${2:-}"
env_name="${SKIPA_ENV:-staging}"
# Where infra/ansible writes the decrypted env files and the origin certificate.
export SKIPA_SECRETS_DIR="${SKIPA_SECRETS_DIR:-/etc/skipa}"
# Extra compose files, space-separated (only for trying the stack on a laptop; unset on servers).
extra_files="${SKIPA_COMPOSE_EXTRA:-}"
here="$(cd "$(dirname "$0")" && pwd)"
cd "$here"

case "$image" in
  *:*) ;;
  *) echo "image needs an explicit tag: $image" >&2; exit 2 ;;
esac
tag="${image##*:}"

# Per-deploy values live apart from the decrypted secrets, so a deploy never rewrites those.
umask 077
printf 'API_IMAGE=%s\nRELEASE=api@0.0.0+%s\n' "$image" "${tag:0:12}" > release.env.next

compose() {
  local files=(-f "$env_name.yaml")
  for f in $extra_files; do files+=(-f "$f"); done
  docker compose "${files[@]}" \
    --env-file "$SKIPA_SECRETS_DIR/compose-$env_name.env" \
    --env-file host.env \
    --env-file release.env.next \
    "$@"
}

echo "pulling $image"
compose pull --quiet
compose up -d --wait postgres

echo "migrating"
compose run --rm --no-deps api node apps/api/scripts/db-migrate.ts

if [ "$seed" = "--seed" ]; then
  echo "seeding"
  compose run --rm --no-deps api node apps/api/scripts/db-seed.ts
fi

echo "starting"
compose up -d --wait --remove-orphans

# Smoke test through Caddy with the real hostname (TLS checked against the origin certificate's
# name, not its issuer: Cloudflare origin certificates are not publicly trusted).
host="$(sed -n 's/^API_HOSTNAME=//p' host.env)"
for path in /health/live /health/ready; do
  if ! curl -fsS --max-time 10 --insecure --resolve "$host:443:127.0.0.1" \
    -o /dev/null -w "$path %{http_code}\n" "https://$host$path"; then
    echo "smoke test failed: $path" >&2
    exit 1
  fi
done

[ -f release.env ] && cp release.env release.env.previous
mv release.env.next release.env
echo "deployed $image"
