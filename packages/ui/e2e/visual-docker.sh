#!/bin/sh
# Run the gallery screenshot + axe suite on Linux x64 in the Playwright image, as CI does, so
# baselines made on any machine match CI (font rasterising differs between macOS and Linux, and
# between arm64 and x64). Copies the repo into the container (native modules differ per platform),
# installs Node 24 (the image ships another version), runs, and copies e2e/__screenshots__ back.
# Extra arguments go to `playwright test`, e.g. `--update-snapshots`.
set -eu
repo=$(cd "$(dirname "$0")/../../.." && pwd)
node_version=$(cat "$repo/.nvmrc")
case "$node_version" in *.*.*) ;; *) node_version=24.22.3 ;; esac
# x64 matches CI. VISUAL_ARCH=arm64 runs natively on Apple silicon for a quick check, but commit
# baselines made on x64 (CI's `visual` job can produce them; see packages/ui/README.md).
arch=${VISUAL_ARCH:-x64}
platform=$([ "$arch" = arm64 ] && echo linux/arm64 || echo linux/amd64)
docker run --rm --platform "$platform" \
  -v "$repo:/src:ro" -v "$repo/packages/ui/e2e/__screenshots__:/out" -w /work \
  mcr.microsoft.com/playwright:v1.65.1-noble sh -c "
    set -e
    curl -fsSL https://nodejs.org/dist/v$node_version/node-v$node_version-linux-$arch.tar.gz | tar -xz -C /opt
    export PATH=/opt/node-v$node_version-linux-$arch/bin:\$PATH
    tar -C /src --exclude=node_modules --exclude=.turbo --exclude='*/dist' --exclude=.git -cf - . | tar -xf -
    corepack enable
    pnpm install --frozen-lockfile >/dev/null
    pnpm tokens:build >/dev/null
    cd packages/ui
    cp -r /out/. e2e/__screenshots__/ 2>/dev/null || true
    status=0
    CI=1 pnpm exec playwright test -c e2e/playwright.config.ts $* || status=\$?
    rm -rf /out/* && cp -r e2e/__screenshots__/. /out/
    exit \$status
  "
