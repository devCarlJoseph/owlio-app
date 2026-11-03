# Feature delivery

Use for new behavior or meaningful changes to an existing flow. Use [reference UI](reference-ui.md) for a visual-only task and [API integration](api-integration.md) for HTTP changes.

## Define

1. Identify the affected role(s), entry route, user outcome, and scope.
2. Read the relevant [product boundary](../product/overview.md) and role-plan section. Inspect source and [capability status](../architecture/capability-status.md).
3. Establish owner, audience, data source, persistence, allowed actions, and observable acceptance criteria. Separate existing functionality from requested additions.
4. Resolve essential missing contracts/product decisions before dependent implementation. Do not turn ordinary layout choices into approval requests.

## Build

- Follow the current feature boundaries; keep route adapters thin and shared controls domain-neutral.
- Preserve the distinction between personal tasks, peer study, official classwork, private teaching notes, and published feedback.
- Handle states that follow from actual behavior: loading, empty, validation, error/retry, unavailable, and confirmed success where applicable. A static local control does not need invented network states.
- Use confirmed API services for account-backed behavior. Browser-local or preview work must clearly express its actual storage and availability.
- Synchronize affected routes, navigation, active state, title, and navigation search.

## Complete

Verify the acceptance criteria and relevant role/ownership boundaries using [verification](verification.md). Add meaningful regression coverage for new logic or changed behavior; avoid tests that merely mirror markup. Inspect the rendered result for visible changes.

Update affected product/status/integration docs and report actual results and dependencies. Keep the task moving through fix-and-recheck until the authorized outcome is complete.

[Agent workflow](README.md)
