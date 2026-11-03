# Bug investigation and repair

Use for incorrect behavior, regressions, or failures with an expected result.

1. Establish the observed and expected behavior, affected role/route, reproduction conditions, and runtime mode. Inspect relevant code and tests before choosing a fix.
2. Reproduce with the available test, browser, or service evidence. For intermittent issues, inspect timing, stale requests, storage, and account transitions as applicable. Separate confirmed findings from hypotheses.
3. Trace the failing state/data path and fix the cause within the requested scope. Preserve unrelated user changes and existing contracts.
4. Add a focused regression test when it meaningfully captures a behavioral defect. For a small styling/copy correction, rendered inspection or a direct check can be sufficient.
5. Verify the reproduction now succeeds and check nearby behavior likely to be affected. Use [verification](verification.md); for a visual mismatch use [reference UI](reference-ui.md).
6. Update docs only if the documented contract or behavior changed. Report the cause, resulting behavior, actual checks, and remaining uncertainty.

An unrelated repository failure is not automatically part of this repair. Identify its scope and evidence; do not disable checks or broaden the patch simply to obtain a clean result.

[Agent workflow](README.md)
