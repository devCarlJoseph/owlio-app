# API integration

Use when adding/changing HTTP calls, authentication/session behavior, or switching a feature from preview/local state to account-backed records.

## Establish the contract

1. Inspect the relevant `src/services/api/` client, types, view/provider, runtime flag, and existing integration document.
2. Establish the backend contract from available backend source or an owner-confirmed specification: route/method, authentication/CSRF, request/response shapes, roles/ownership, errors, pagination, and cancellation.
3. Identify the data owner, persistence, account-switch behavior, and meaning of success. If the backend contract is missing, complete independent UI/types planning and report the exact missing contract; do not invent a working endpoint.
4. Preserve `API_INTEGRATION_ENABLED` unless the request includes changing mode. A visual redesign does not require enabling APIs.

## Integrate

- Use the credentialed Axios/auth helpers and typed service adapters. Keep server-only credentials, provider runtimes, and database access out of the frontend.
- Derive access from authenticated identity and server records. A role prefix or hidden button does not authorize an operation.
- Distinguish read failures from empty results and confirmed mutations from later refresh failures. Preserve user input on recoverable failures.
- Cancel/ignore stale reads and clear account-scoped data when the session changes. Respect existing retry limits; avoid duplicate mutation effects.
- Keep explicit preview data separate from connected records. API failure must not silently create a successful preview record.
- Unsupported account actions stay unavailable until their contracts exist. Do not infer uploads, sync, saved discussion, or official records from a screen's appearance.

## Verify and document

Use focused service/component tests for relevant success, failure, ownership, cancellation, and session-transition paths. Follow [verification](verification.md). Mocked HTTP tests establish client behavior; verify deployed cookies/CORS, backend authorization, and real persistence separately when the environment and authorization allow it.

Update the owning integration document and [capability status](../architecture/capability-status.md). Record frontend implementation, runtime enablement, and live checks separately. Backend deployment/migrations require the relevant repository and task scope.

[Auth details](../AUTH_ROUTE_ACCESS.md) | [Classroom details](../CLASSROOM_API_INTEGRATION.md) | [Agent workflow](README.md)
