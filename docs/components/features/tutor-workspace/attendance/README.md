# attendance

This directory mirrors `src/components/features/tutor-workspace/attendance/`. For the current files, proposed component folders, and manual migration checks, use the [tutor-workspace guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/tutor-workspace/attendance/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `tutor-attendance-view.tsx`

Current file: `src/components/features/tutor-workspace/attendance/tutor-attendance-view.tsx`

```tsx
import { CalendarCheck, Users } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorAttendanceView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Session Attendance"
      description="Record attendance explicitly for an actual tutoring session, including each participant in a supported group session."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Session roll call" description="Select an authorized session and use only its eligible participants.">
          <CalendarCheck aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
        <TutorSection title="Learner history" description="Individual attendance history and corrections require service-defined rules.">
          <Users aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
      </div>
      <TutorUnavailable
        title="Attendance records are unavailable"
        description="No tutor attendance service or session roster is connected. LiveKit presence, room duration, chat, and screen sharing are not attendance."
      />
    </TutorPage>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
