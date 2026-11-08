# Communication

`src/components/features/communication/` currently has no TypeScript or CSS feature code to reorganize. Find the actual discussion or notification owner before moving code here.

[Feature guide index](../README.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/communication/index.tsx`

**Future-only adapter:** `src/components/features/communication/communication-view.tsx` does not exist yet. This domain has no feature implementation yet. Move the current role-aware placeholder into a feature view before using the adapter below.

```tsx
import { CommunicationView } from "@/components/features/communication/communication-view"

export default function CommunicationPage() {
  return <CommunicationView />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/communication/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

No TypeScript, JavaScript, or CSS source files are directly in this folder.

<!-- END GENERATED CURRENT SOURCE -->
