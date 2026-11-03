---
name: owlio-api-contract-integration
description: Implement or repair Owlio API operations from confirmed contracts, including typed adapters and cookie/CSRF session behavior. Use when HTTP behavior changes; exclude visual-only and browser-local tasks.
---

# Owlio API contract integration

Translate an established backend contract into reliable frontend behavior. Use the [API integration SOP](../../../docs/sops/api-integration.md) for task flow and scope.

## Locate contract and mode

Inspect the affected service, types, consumer/provider, and tests. Use available backend source or an owner-confirmed specification to establish method/path, payload/envelope, errors, ownership, and pagination. An existing client is implementation evidence, not independent proof of a deployed backend contract.

- [Axios configuration](../../../src/lib/axios.ts): credentialed client and API base URL.
- [API types](../../../src/services/api/api.types.ts) and [error helpers](../../../src/services/api/api-error.ts).
- [Authentication service](../../../src/services/api/auth.service.ts): CSRF acquisition/retry and auth operations.
- [Classroom service](../../../src/services/api/classroom.service.ts): pagination, creation, enrollment, and roster reads.
- [Classroom provider](../../../src/components/features/classrooms/classroom-prototype-provider.tsx): record adaptation, stale reads, account/role remounting.
- [API mode](../../../src/lib/api-mode.ts) and [capability map](../../../docs/architecture/capability-status.md): implemented clients versus enabled behavior.

Missing backend decisions block only dependent integration. Continue independent UI/planning work and identify the missing contract precisely. Never fabricate an endpoint or successful response.

## Implement the boundary

- Keep HTTP calls in typed services and adapt response records at the boundary. TypeScript annotations alone do not validate arbitrary runtime payloads; add validation where the contract/change requires it.
- Reuse `postApiWithCsrf` for compatible mutations. It retries once only for HTTP 403 with `INVALID_CSRF`; do not turn every 403 into a refresh/replay loop.
- Keep session refresh behavior separate from CSRF refresh. Preserve HttpOnly cookies, in-memory CSRF, safe return URLs, and existing auth/session error handling.
- Derive ownership from server identity/records. Inspect [auth access](../../../docs/AUTH_ROUTE_ACCESS.md) for role mapping and session semantics; a workspace prefix does not grant permission.
- Propagate abort signals for reads where supported and ignore stale completions. Account changes must not retain another account's records or one-time join codes.
- Implement cursor termination and repeated-cursor handling for paginated reads. For roster pages, preserve the actual contract's pagination rather than assuming all APIs return arrays.
- Preserve partial success: enrollment can succeed before its follow-up classroom fetch fails. Tell the user what was confirmed and avoid blindly repeating the mutation.
- Keep connected errors distinct from the explicit preview provider. Never fall back to a fictional successful save after a live API failure.

## Verification and delivery

Use focused service/provider tests for the paths affected: envelopes/payloads, confirmed success, errors, retry limits, pagination, cancellation, or account transition. Inspect [auth tests](../../../src/services/api/auth.service.test.ts) and [classroom tests](../../../src/services/api/classroom.service.test.ts) when relevant.

Follow [verification](../../../docs/sops/verification.md). Mocked HTTP tests do not verify deployed cookies/CORS, backend authorization, provider credentials, or database persistence. Live checks require an available environment and authorized operations; preserve the global mode unless its change is part of the task.

Update the owning integration document and capability status when behavior changes. Report contract evidence, client behavior, tests, and any remaining backend/deployment dependency.

## Trigger boundaries

- Use: "Connect the classroom list to this approved paginated contract"; "Fix duplicate CSRF retries during a mutation."
- Skip: "Match this classroom screenshot"; "Change the local notes storage format." Do not activate solely because a component imports an existing service.
