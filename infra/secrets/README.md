# infra/secrets

Encrypted environment files for servers (brief §15, AD §11.2: SOPS + age). Local development
uses git-ignored plain files from `pnpm local:env` instead.

| File                                                      | Used by                       | Variable names                      |
| --------------------------------------------------------- | ----------------------------- | ----------------------------------- |
| `staging.sops.env`                                        | staging API and worker        | `apps/api/.env.example`             |
| `production.sops.env`                                     | production API and worker     | `apps/api/.env.example`             |
| `compose-staging.sops.env`, `compose-production.sops.env` | Postgres, GlitchTip, Grafana  | `infra/compose/staging.env.example` |
| `origin-staging.sops.json`, `origin-production.sops.json` | Caddy (Cloudflare origin TLS) | `{"cert": "…", "key": "…"}`         |

Rules:

- Only encrypted files are committed here. CI (`security` job, `scripts/check-sops-encrypted.sh`)
  fails if any file in this folder lacks SOPS metadata.
- Paystack: test keys (`sk_test_`/`pk_test_`) in staging; live keys only in production. The API
  refuses to start otherwise (`apps/api/src/platform/config.ts`).
- Decryption happens on the server (infra/ansible, role `skipa`) with the server's own age key
  (`/etc/skipa/age.key`, created by the playbook, which prints its public key). Plain values go to
  `/etc/skipa` (root-owned, readable by the `deploy` group) and never pass through CI.

## Not set up yet (needs the lead)

The encrypted files and `.sops.yaml` need the age **public** keys of the people and servers
allowed to decrypt. Once the lead sends them, add at the repo root:

```yaml
# .sops.yaml
creation_rules:
  - path_regex: ^infra/secrets/.*\.sops\.(env|json)$
    age: >-
      age1lead...,
      age1stagingserver...
```

Then (sops 3.13.3, age 1.3.2) encrypt and delete the plain files:

```bash
sops --encrypt --input-type dotenv --output-type dotenv staging.env > infra/secrets/staging.sops.env
sops --encrypt --input-type dotenv --output-type dotenv compose-staging.env > infra/secrets/compose-staging.sops.env
sops --encrypt origin-staging.json > infra/secrets/origin-staging.sops.json
```
