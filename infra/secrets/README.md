# infra/secrets

Encrypted environment files for servers (brief §15, AD §11.2: SOPS + age). Local development
uses git-ignored plain files from `pnpm local:env` instead.

| File                                                      | Used by                      | Variable names               |
| --------------------------------------------------------- | ---------------------------- | ---------------------------- |
| `staging.sops.env`                                        | staging API and worker       | `apps/api/.env.example`      |
| `production.sops.env`                                     | production API and worker    | `apps/api/.env.example`      |
| `compose-staging.sops.env`, `compose-production.sops.env` | Postgres container passwords | `infra/compose/.env.example` |

Rules:

- Only encrypted files are committed here. CI (`security` job, `scripts/check-sops-encrypted.sh`)
  fails if any file in this folder lacks SOPS metadata.
- Paystack: test keys (`sk_test_`/`pk_test_`) in staging; live keys only in production. The API
  refuses to start otherwise (`apps/api/src/platform/config.ts`).
- Decryption happens on the server at deploy time (infra/ansible); keys never pass through CI logs.

## Not set up yet (needs the lead)

The encrypted files and `.sops.yaml` need the age **public** keys of the people and servers
allowed to decrypt. Once the lead sends them, add at the repo root:

```yaml
# .sops.yaml
creation_rules:
  - path_regex: ^infra/secrets/.*\.sops\.env$
    age: >-
      age1lead...,
      age1stagingserver...
```

Then `sops --encrypt --input-type dotenv --output-type dotenv staging.env > infra/secrets/staging.sops.env`
(sops 3.13.3, age 1.3.2) and delete the plain file.
