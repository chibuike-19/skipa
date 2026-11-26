> **Where these files live in the repo** (lead's placement table, 26 Nov 2026):
> `SKIPA_SYSTEM_ARCHITECTURE.md` → `docs/`; `briefs/*.md` → `docs/briefs/`;
> `api/openapi.v1.yaml` → `api/`; `db/schema.sql` → `db/` (backend, done).
> `design/tokens.css` → `packages/tokens/` and `mocks/fixtures/*.json`, `mocks/validate_fixtures.py`
> → `packages/mocks/` are moved by the **frontend agent**; until then they are here, in this folder.
> The PDFs stay here. Paths in the table below are the pack's original layout.

# Skipa architecture pack v1.0 (25 Nov 2026)

| Path | What it is | Give to |
|---|---|---|
| `SKIPA_SYSTEM_ARCHITECTURE.md` | System Architecture Document (sections 1–17, Appendix A endpoint index, Appendix B PRD traceability) | Both agents, team |
| `briefs/BACKEND_AGENT_BRIEF.md` | Backend agent brief | Backend agent |
| `briefs/FRONTEND_AGENT_BRIEF.md` | Frontend agent brief (links to every Claude Design screen) | Frontend agent |
| `api/openapi.v1.yaml` | API contract, OpenAPI 3.1: 177 operations, 148 schemas | Both agents |
| `db/schema.sql` | PostgreSQL 18 schema, first migration | Backend agent |
| `mocks/fixtures/*.json`, `mocks/validate_fixtures.py` | Example payloads validated against the contract | Frontend agent (backend for reference) |
| `design/tokens.css` | Design tokens v1.1 exported from the Claude Design canvas | Frontend agent |
| `downloads/*.pdf` | PDF versions of the document and both briefs | Anyone |

Each agent also receives the PRD (v2.0 + v1.0); the frontend agent also gets the design canvas link:
https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH

Checks: `npx @redocly/cli lint api/openapi.v1.yaml` · `python3 mocks/validate_fixtures.py`
