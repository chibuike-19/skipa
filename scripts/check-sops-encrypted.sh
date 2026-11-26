#!/usr/bin/env sh
# Fails if any committed file in infra/secrets (other than README.md) is not SOPS-encrypted.
set -eu
status=0
for file in $(git ls-files infra/secrets); do
  case "$file" in
    infra/secrets/README.md) continue ;;
  esac
  if ! grep -q '^sops_version=' "$file" && ! grep -q '"sops":' "$file" && ! grep -q '^sops:' "$file"; then
    echo "::error file=$file::not SOPS-encrypted; never commit plain secrets"
    status=1
  fi
done
[ "$status" -eq 0 ] && echo "infra/secrets: every file is encrypted (or the folder holds only the README)"
exit "$status"
