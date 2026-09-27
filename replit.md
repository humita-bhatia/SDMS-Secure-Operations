# SDMS Secure Operations Console

SDMS is a frontend-only secure document operations console that simulates controlled release, recipient decryption, forensic attribution, and private ledger verification.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sdms-console/src/App.tsx` — role-based routes, deterministic mock services, and interactive Phase 1 workflows
- `artifacts/sdms-console/src/index.css` — SDMS icy operations design tokens and shared surface utilities
- `attached_assets/` — source PRD files

## Architecture decisions

- Phase 1 is intentionally frontend-only; cryptography, watermarking, ledger persistence, and authentication are simulations.
- The UI uses deterministic IDs and in-memory state so the happy path is repeatable for demos.
- Role-aware pages share a horizontal shell and consume centralized mock records instead of scattering business data through screens.
- The visual system uses the PRD's mist/cyan/deep-teal palette, structured tables, split panes, and technical drawers rather than generic dashboard cards.

## Product

- Authority release workflow with recipient selection and cryptographic architecture review
- Recipient document register and staged local decryption simulation
- Admin event register, PQC status, private ledger inspection, verify/tamper/restore controls, and system health
- Investigator upload simulation, forensic analysis, evidence chain, technical node drawers, and matched-event report

## User preferences

- Follow the attached SDMS PRD literally for visual identity and Phase 1 scope.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
