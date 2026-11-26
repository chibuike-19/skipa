# infra/ansible

Provisions a Skipa server and deploys the stack in `infra/compose` (AD §12.5). Staging only for
now; production (LUKS data volume, pgBackRest, Prometheus) follows the same playbook later.

| Role     | What it does                                                                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`   | Updates, unattended security upgrades, UTC, persistent journald, `deploy` user (keys only, sudo), SSH without root or passwords, ufw (22 from `ssh_allowed_cidrs`, 80/443 from Cloudflare), fail2ban |
| `docker` | Docker Engine + Compose plugin from Docker's apt repository; container logs to journald                                                                                                              |
| `skipa`  | Installs the stack at `/srv/skipa`, gives the server its own age key, decrypts `infra/secrets` on the server into `/etc/skipa`, creates the database roles, runs `deploy.sh`                         |

Not yet run against a real server (no access yet). Checked in CI: syntax and `ansible-lint`
(production profile). The compose stack, roles SQL and `deploy.sh` were run end to end on Docker
locally.

## Before the first run (the lead)

1. A Hetzner CPX22 with Ubuntu 24.04 and your SSH key for root. DNS `api.staging.skipa.ng`
   proxied by Cloudflare, SSL mode Full (strict), and a Cloudflare origin certificate for it.
2. In `group_vars/all.yml`: `ssh_allowed_cidrs` (your addresses) and `deploy_authorized_keys`
   (your key and the CI deploy key). The playbook refuses to run without them.
3. Tools on your machine: `pip install ansible-core==2.21.6`, then
   `ansible-galaxy collection install -r requirements.yml -p .collections`.

## Run

```bash
cd infra/ansible
SKIPA_HOST=<server ip> SKIPA_SSH_USER=root ansible-playbook -i inventory/staging.yml site.yml
```

The first run hardens the server, installs Docker, creates the server's age key, prints its
public key and stops, because the encrypted files do not exist yet. Then:

1. Add your age public key and the server's to `.sops.yaml` (see `infra/secrets/README.md`).
2. Encrypt three files into `infra/secrets/`:
   - `staging.sops.env`: every name in `apps/api/.env.example` (`APP_ENV=staging`, test Paystack
     keys, `DATABASE_*` URLs for `skipa_app`, `skipa_platform`, `skipa_owner` at `postgres:5432/skipa`)
   - `compose-staging.sops.env`: the names in `infra/compose/staging.env.example`
   - `origin-staging.sops.json`: `{"cert": "<origin certificate PEM>", "key": "<private key PEM>"}`
3. Run again, now as `deploy` (root can no longer log in), with an image to deploy:

```bash
SKIPA_HOST=<server ip> GHCR_USER=<github user> GHCR_TOKEN=<read:packages token> \
  ansible-playbook -i inventory/staging.yml site.yml -e api_image=ghcr.io/<owner>/skipa-api:<sha>
```

After that every merge to `main` deploys through `.github/workflows/deploy-staging.yml` once the
repository variable `STAGING_HOST` and the secrets `STAGING_SSH_KEY`, `STAGING_KNOWN_HOSTS` exist.

## Day to day

- **Deploy or roll back by hand:** `ssh deploy@<host> /srv/skipa/compose/deploy.sh <image> --seed`
  (the previous image is in `/srv/skipa/compose/release.env.previous`).
- **Grafana and GlitchTip** listen on the server's 127.0.0.1 only:
  `ssh -L 3000:127.0.0.1:3000 -L 8000:127.0.0.1:8000 deploy@<host>`, then open
  `http://localhost:3000` (user `admin`, password `GRAFANA_ADMIN_PASSWORD`) and
  `http://localhost:8000`.
- **First GlitchTip user** (sign-up is off):
  `docker compose -f staging.yaml ... exec glitchtip ./manage.py createsuperuser`, then create the
  project and put its DSN (host `glitchtip:8000`) in `SENTRY_DSN` in `staging.sops.env`.
- **Logs:** Grafana → Explore → Loki, e.g. `{service="api"} | json | request_id="…"`.
