# settings

This directory mirrors `src/components/features/tutor-workspace/settings/`. For the current files, proposed component folders, and manual migration checks, use the [tutor-workspace guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/tutor-workspace/settings/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `tutor-settings-view.tsx`

Current file: `src/components/features/tutor-workspace/settings/tutor-settings-view.tsx`

```tsx
import { Settings2, UserRound } from "lucide-react"
import { Link } from "react-router"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorSettingsView() {
  return (
    <TutorPage
      eyebrow="Account"
      title="Profile & Settings"
      description="Profile and preferences can be edited only when the authenticated profile/preferences service supports those fields."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Profile">
          <UserRound aria-hidden="true" className="size-5 text-blue-700" />
          <p className="text-sm leading-6 text-slate-600">Tutor profile details and editing are not connected on this page.</p>
        </TutorSection>
        <TutorSection title="Preferences">
          <Settings2 aria-hidden="true" className="size-5 text-blue-700" />
          <p className="text-sm leading-6 text-slate-600">Teaching defaults and notification preferences require a supported settings contract.</p>
        </TutorSection>
      </div>
      <TutorUnavailable
        title="Profile settings are unavailable"
        description="No tutor profile or preferences update service is connected. No editable fields or local-save behavior are shown."
      />
      <Link to="/tutors/account/security" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        Open account security
      </Link>
    </TutorPage>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
