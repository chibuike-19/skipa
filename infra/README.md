# infra

**Owner:** backend agent.

| Folder            | What                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `compose/`        | `dev.yaml` (local Postgres), `staging.yaml` (staging stack), `deploy.sh` (one deploy path) |
| `caddy/`          | Public entry point: Cloudflare origin TLS, trusted Cloudflare ranges, `/internal` blocked  |
| `loki/`, `alloy/` | Logs: journald → Alloy → Loki, 90 days                                                     |
| `grafana/`        | Provisioned data sources (dashboards and alert rules arrive with their milestones)         |
| `ansible/`        | Server provisioning and first deploy (see its README)                                      |
| `secrets/`        | SOPS-encrypted env files only (see its README)                                             |

Still to come: `pgbackrest/`, `prometheus/` and exporters, `kuma/`, `compose/production.yaml`.
