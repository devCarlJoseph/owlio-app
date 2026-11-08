# Attendance

`src/components/features/attendance/` currently has no TypeScript or CSS feature code to reorganize. Attendance UI lives in other feature domains; inspect the actual owner before adding guidance here.

[Feature guide index](../README.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/educators/attendance/index.tsx`

**Future-only adapter:** `src/components/features/attendance/educator-attendance-view.tsx` does not exist yet. This domain has no feature implementation yet. Move the sample attendance UI into a feature view without implying live presence is official attendance.

```tsx
import { EducatorAttendanceView } from "@/components/features/attendance/educator-attendance-view"

export default function EducatorAttendancePage() {
  return <EducatorAttendanceView />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/attendance/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

No TypeScript, JavaScript, or CSS source files are directly in this folder.

<!-- END GENERATED CURRENT SOURCE -->
