# Verification and handoff

Choose checks for the changed behavior. Keep evidence explicit; historical results do not establish the current state.

| Change | Expected evidence |
| --- | --- |
| Documentation/instructions only | Inspect the diff, validate local links/anchors and referenced paths, check routing/consistency, run `git diff --check`. Application tests/build are unnecessary unless runtime files change. |
| Visual/layout | Inspect the rendered target, compare with any reference, check narrow layout and affected interactions; focused lint for changed TS/TSX and build for runtime changes. |
| Logic, forms, state, or persistence | Focused behavioral tests, focused lint, build, and relevant browser interactions. Broaden tests for shared behavior or unresolved regression risk. |
| Routes, auth, shared providers, or API clients | Relevant service/component/guard tests, full lint and build, plus browser/integration checks when available. Report mocked versus live evidence. |
| Shared theme/UI primitive | Render affected consumers and themes, check keyboard/focus, and run focused tests/lint/build as relevant. |

For runtime changes, obtain full-repository lint status before handoff; identify unrelated findings with evidence. Once checks pass, repeat/broaden them only for new changes, failures, or unresolved concerns.

## Available commands

Run from the repository root with npm; PowerShell can use `npm.cmd`/`npx.cmd` if script policy blocks the shell wrapper.

```sh
npm run dev
npm run build
npm run lint
npm test -- --pool=threads
npx vitest run <test-path> --pool=threads
npx eslint <changed-files>
git diff --check
```

`npm run build` runs TypeScript project checking and Vite bundling. A Vite-only build does not establish TypeScript correctness. Vitest uses jsdom; the threads pool avoids previously observed Windows fork-worker startup timeouts.

## Evidence and completion

- Inspect command output and the final diff. Fix failures caused by the change; do not globally suppress checks.
- For UI work, report route, viewport(s), and interactions actually inspected. A build/test pass does not establish screenshot similarity.
- For integration work, state whether HTTP was mocked or the live backend was exercised. Do not claim real account persistence from a preview or local-storage check.
- Report blocked/skipped checks and the reason. Keep a tooling limitation distinct from a product defect.
- Update only the documents whose facts changed. Keep old dated reports historical.
- Summarize resulting behavior, key files, actual checks, and material remaining limitations. Mark incomplete work clearly.

## Workflow checks for instruction changes

Walk through these routing cases: screenshot reproduction, reference-as-inspiration, behavior change, API integration, bug fix, and documentation-only edit. Each should select a small relevant context set and have an observable completion condition.

Confirm reference reproduction allows scoped visual changes; product boundaries still protect ownership and real data; deleted skills/missing documents are not mandatory dependencies. Actual image-matching quality requires a separate implementation task with a reference and rendered comparison.

[Agent workflow](README.md)
