# Personal workspace breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(personal-workspace): add organized personal workspace source copies`

Target: `src/components/features/personal-workspace/`. Each tool owns its own records, examples, and screens. Use the corresponding file map rather than creating a single global personal workspace context.

| Subfeature | Manual plan |
| --- | --- |
| Classwork | [classwork/](classwork/README.md) |
| Notes (already organized) | [notes/](notes/README.md) |
| Student overview | [student-overview/](student-overview/README.md) |
| Study Spaces and room detail | [study-spaces/](study-spaces/README.md) |
| Subjects | [subjects/](subjects/README.md) |
| Tasks | [tasks/](tasks/README.md) |

Keep browser-local personal records distinct from classroom assignments, official results, and account sync. Do not rename storage keys or convert a preview sample into a stored record while reorganizing source. Apply the [shared folder contract](../../../sops/component-decomposition.md) inside each subfeature.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/students/classwork/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { ClassworkView } from "@/components/features/personal-workspace/classwork/classwork-view"

export default function StudentClassworkPage() {
  return <ClassworkView />
}
```

### `src/pages/dashboard/students/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { StudentOverviewView } from "@/components/features/personal-workspace/student-overview/student-overview-view"

export default function StudentsPage() {
  return <StudentOverviewView />
}
```

### `src/pages/dashboard/students/notes/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { NotesView } from "@/components/features/personal-workspace/notes/view/notes-view"

export default function StudentNotesPage() {
  return <NotesView />
}
```

### `src/pages/dashboard/students/study-spaces/detail/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { StudySpaceDetailView } from "@/components/features/personal-workspace/study-spaces/detail/study-space-detail-view"

export default function StudentStudySpaceDetailPage() {
  return <StudySpaceDetailView />
}
```

### `src/pages/dashboard/students/study-spaces/detail/lazy.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { lazy } from 'react'

export default lazy(() => import('./index'))
```

### `src/pages/dashboard/students/study-spaces/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { StudySpacesView } from "@/components/features/personal-workspace/study-spaces/study-spaces-view"

export default function StudentStudySpacesPage() {
  return <StudySpacesView />
}
```

### `src/pages/dashboard/students/subjects/detail/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { SubjectDetailView } from "@/components/features/personal-workspace/subjects/subject-detail-view"

export default function StudentSubjectDetailPage() {
  return <SubjectDetailView />
}
```

### `src/pages/dashboard/students/subjects/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { SubjectsView } from "@/components/features/personal-workspace/subjects/subjects-view"

export default function StudentSubjectsPage() {
  return <SubjectsView />
}
```

### `src/pages/dashboard/students/tasks/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { TasksView } from "@/components/features/personal-workspace/tasks/tasks-view"

export default function StudentTasksPage() {
  return <TasksView />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/personal-workspace/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### Nested feature guides

- [`classwork/`](classwork/README.md)
- [`notes/`](notes/README.md)
- [`student-overview/`](student-overview/README.md)
- [`study-spaces/`](study-spaces/README.md)
- [`subjects/`](subjects/README.md)
- [`tasks/`](tasks/README.md)

No TypeScript, JavaScript, or CSS source files are directly in this folder.

<!-- END GENERATED CURRENT SOURCE -->
