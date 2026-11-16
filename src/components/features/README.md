# Feature modules

Compose screens from feature-owned building blocks using existing Tailwind and UI wrappers. Retain domain/subfeature boundaries; add folders only for real responsibilities:

- `view/`: screen composition
- `ui/`: styled feature-specific display blocks
- `forms/`: input flows, dialogs, editors
- `hooks/`: state and lifecycle orchestration
- `context/`: scoped providers and stores
- `utils/`: formatting and model helpers
- `contents/`: static copy and labeled examples
- `types/`: domain contracts
- `schemas/`: validation contracts
- `tests/`: behavioral tests and fixtures

Use direct imports. Shared domain-neutral controls belong in `src/components/ui/`, HTTP in `src/services/api/`, and global provider composition in `src/context/`. Preserve storage keys, API contracts, provider mounting, and lazy-loading boundaries during extraction.

See the [architecture guide](../../../docs/architecture/feature-composition.md) and classroom modules for an integrated example.
