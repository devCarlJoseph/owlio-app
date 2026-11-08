# notes

This directory mirrors `src/components/features/tutor-workspace/notes/`. For the current files, proposed component folders, and manual migration checks, use the [tutor-workspace guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/tutor-workspace/notes/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `tutor-session-notes-view.tsx`

Current file: `src/components/features/tutor-workspace/notes/tutor-session-notes-view.tsx`

```tsx
import { LockKeyhole, MessageCircleMore } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorSessionNotesView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Session Notes"
      description="Keep tutor-only observations separate from feedback intentionally published to a learner."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Private tutor notes" description="Private notes require explicit tutor-only access and retention rules.">
          <LockKeyhole aria-hidden="true" className="size-5 text-slate-700" />
          <p className="text-sm text-slate-600">These notes must not appear in learner feeds, group discussions, notifications, or progress views.</p>
        </TutorSection>
        <TutorSection title="Learner-visible feedback" description="Publishing is a separate action with a confirmed audience.">
          <MessageCircleMore aria-hidden="true" className="size-5 text-blue-700" />
          <p className="text-sm text-slate-600">A private note never becomes feedback automatically.</p>
        </TutorSection>
      </div>
      <TutorUnavailable
        title="Notes and feedback are unavailable"
        description="No session-note or feedback service is connected. Creating, saving, or publishing records is unavailable."
      />
    </TutorPage>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
