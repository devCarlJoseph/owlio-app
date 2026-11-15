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

The routed app requires a real Owlio API session and API-assigned workspace roles. Preview bypasses, sample dashboards, room-layout previews, and local onboarding are no longer reachable. `/onboarding` redirects to API-backed registration.

Set the public API origin using `VITE_API_URL` (default `http://localhost:7000`). The backend's `FRONTEND_URL` must exactly match the frontend origin. Authentication uses HttpOnly cookies and CSRF, with no API key in the browser. See [API connection](docs/API_CONNECTION.md) for connected features, remaining integrations, and verification boundaries.

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
- [API integration skill](.agents/skills/owlio-api-contract-integration/SKILL.md): contract and cookie/CSRF integration guidance.
