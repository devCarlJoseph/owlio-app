# sessions

This directory mirrors `src/components/features/tutor-workspace/sessions/`. For the current files, proposed component folders, and manual migration checks, use the [tutor-workspace guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/tutor-workspace/sessions/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `tutor-sessions-view.tsx`

Current file: `src/components/features/tutor-workspace/sessions/tutor-sessions-view.tsx`

```tsx
import { scheduleContent } from "@/components/features/schedule/schedule-content"
import { ScheduleWorkspaceView } from "@/components/features/schedule/schedule-workspace-view"

export default function TutorSessionsView() {
  return <ScheduleWorkspaceView content={scheduleContent.tutors} />
}
```

<!-- END GENERATED CURRENT SOURCE -->
