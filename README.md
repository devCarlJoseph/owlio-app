# Owlio

Owlio is a learning and teaching application for students, school educators, ESL teachers, and tutors. Personal learning, peer study, and educator-led records have distinct ownership and workflows.

This repository contains the React/TypeScript frontend and API clients. Backend services and infrastructure are maintained separately.

## Develop locally

Use npm and the committed lockfile:

```sh
npm ci
npm run dev
```

Vite prints the local development URL. Public configuration names are documented in `.env.example`; private environment values must stay out of source and logs. Client `VITE_*` values are visible in the browser bundle.

## Operating mode

[API integration mode](src/lib/api-mode.ts) currently defaults to paused UI preview. Registered pages are browsable without an API session; API-backed writes and real sign-in are paused. Some tools save in browser storage; others are tab-memory examples or unavailable. Preview mode also applies to production builds made with this flag.

See [capability status](docs/architecture/capability-status.md) before treating a visible feature as account-backed. Change integration mode only as part of an intentional integration task.

## Checks

```sh
npm run build
npm run lint
npm test -- --pool=threads
```

Use [verification guidance](docs/sops/verification.md) to choose focused checks and distinguish browser, mocked API, and live integration evidence.

## Working on Owlio

- [Agent instructions](AGENTS.md): concise repository rules and task routing.
- [Documentation index](docs/index.md): product plans, architecture, and integration details.
- [Product overview](docs/product/overview.md): roles, ownership, and shared product direction.
- [Agent workflow](docs/sops/README.md): inspect, implement, validate, and hand off.
- [Reference UI workflow](docs/sops/reference-ui.md): implement images with rendered comparison.
- [Skills policy](.agents/README.md): optional specialized procedures; no repository skills are required.
