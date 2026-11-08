# communication

This directory mirrors `src/components/features/tutor-workspace/communication/`. For the current files, proposed component folders, and manual migration checks, use the [tutor-workspace guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/tutor-workspace/communication/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `tutor-announcements-view.tsx`

Current file: `src/components/features/tutor-workspace/communication/tutor-announcements-view.tsx`

```tsx
import { Megaphone } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorAnnouncementsView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Announcements"
      description="Tutor-authored notices need an explicitly selected learner or group audience and service-confirmed publication."
    >
      <TutorSection title="Notice audience" description="No learner/group audience can be selected until authorized tutoring relationships are loaded.">
        <Megaphone aria-hidden="true" className="size-5 text-blue-700" />
      </TutorSection>
      <TutorUnavailable
        title="Announcements are unavailable"
        description="No announcement service is connected. Drafting, publishing, scheduling, retracting, and delivery status are not represented as available."
      />
    </TutorPage>
  )
}
```

### `tutor-discussions-view.tsx`

Current file: `src/components/features/tutor-workspace/communication/tutor-discussions-view.tsx`

```tsx
import { MessagesSquare } from "lucide-react"
import { TutorPage, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorDiscussionsView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Discussions"
      description="Keep questions and replies attached to the learner, group, session, or activity they concern."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <MessagesSquare aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">Contextual threads</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Thread authorship, audience, timestamps, and replies require a confirmed communication service.</p>
          </div>
        </div>
      </div>
      <TutorUnavailable
        title="Discussions are not connected"
        description="No posts or replies are loaded. Meeting Room chat stays transient and does not become a saved discussion. Direct messages are outside this plan."
      />
    </TutorPage>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
