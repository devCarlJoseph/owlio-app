---
name: owlio-onboarding
description: Build the Owlio new-user onboarding page and wizard flow for three entities — Student, Educator, and Others (ESL teachers, online tutors, freelance educators). UI/UX first; API integration is a later, separate phase.
---

# Owlio Onboarding

Use this skill for any work on the onboarding route (`/onboarding`), its steps, entity selection, profile setup screens, or onboarding UX. Product rules from `OWLIO_FRONTEND_GUIDE.md` still apply. If a request conflicts with this skill, raise it with the project owner instead of silently changing scope.

## 1. Phase rule (read first)

### Phase 1 — UI/UX workflow (current phase)

Build the complete visual and interactive workflow:

- Layout, steps, navigation, field validation, responsive behavior, accessibility.
- Local React state only (React Hook Form + component/reducer state).
- **Do not** call axios, TanStack Query, or any `src/services/*` module from onboarding.
- **Do not** persist anything in localStorage, sessionStorage, or cookies.
- **Do not** show messages that imply data was saved to the server ("Profile saved!"). The Finish action ends on a local Done screen.
- Controls that depend on the backend (join class code, create classroom, avatar upload) are visually complete but clearly non-functional or labeled as coming later.

### Phase 2 — API integration (only when explicitly requested)

Server-driven gating, step saving, and completion. See section 9. Do not start Phase 2 work while implementing Phase 1.

## 2. Entities

Onboarding asks every new user to pick one of three entities:

| Card | Who it is for | Card copy intent | Maps to (Phase 2) |
|---|---|---|---|
| **Student** | Learners studying independently or in classes | Organize subjects, tasks, notes; join classes and study spaces | `STUDENT` role |
| **Educator** | School teachers, college instructors | Run classrooms, classwork, grades, attendance | `EDUCATOR` role |
| **Others** | ESL teachers, online tutors, freelance educators | Flexible lessons, tutoring sessions, learner progress | `EDUCATOR` role + educator subtype |

Rules:

- "Others" is a **UI grouping**, not a separate role. Never model or send a third role.
- The Others subtype (ESL teacher / online tutor / freelance educator) is chosen inside the Others details step, not on the entity card.
- Use adaptable educator wording; do not hard-code a single school model in shared copy.
- Students must be told Owlio is useful without a teacher (personal workspace first).

## 3. UX flow

Single route `/onboarding` rendering a wizard with a visible stepper.

| # | Step | Content |
|---|---|---|
| 1 | Welcome + entity selection | Short welcome, three entity cards as an accessible radio group. Continue is disabled until one is selected. |
| 2 | Profile basics (shared) | Display name (required), avatar placeholder (optional, visual only), timezone (required, default from browser `Intl.DateTimeFormat().resolvedOptions().timeZone`), preferred language (required). |
| 3 | Entity details | Content depends on entity — see below. |
| 4 | Review | Summary grouped by step, each group has an "Edit" action that jumps back to that step. "Finish" button. |
| — | Done | Welcome screen with a role-appropriate next step CTA (Student → personal workspace, Educator/Others → educator dashboard). Destinations may be placeholder routes in Phase 1. |

### Step 3 — entity-specific details

**Student**
- Education level (select: high school, senior high, college, graduate, self-learner, other) — required.
- Subjects or interests (multi-select / tags) — optional.
- Study goals (multi-select: stay organized, prepare for exams, collaborate with peers, improve grades, learn a new skill) — optional.
- "Have a class code?" input — optional, visual only in Phase 1 (helper text: joining happens after setup).

**Educator**
- Teaching context (select: school teacher, college instructor) — required.
- Institution name — optional.
- Subjects taught (tags) — required, at least one.
- Grade / year levels (multi-select) — optional.
- "Create your first classroom" prompt — optional, visual only in Phase 1.

**Others**
- Subtype (radio: ESL teacher, online tutor, freelance educator) — required.
- Languages or subjects taught (tags) — required, at least one.
- Learner levels (multi-select; for ESL show CEFR A1–C2, otherwise beginner / intermediate / advanced) — optional.
- Session format (checkbox: one-on-one, small group, class) — required, at least one.
- Typical availability (weekday/time-of-day chips) — optional.

Keep option lists in `onboarding.constants.ts` so product can change them without touching step components.

### Navigation behavior

- Back and Next on every step except Done; Back is hidden on step 1.
- Validate the current step on Next; never block Back.
- Input is preserved when moving between steps.
- Changing the entity after entity-specific answers exist asks for confirmation, then clears only the entity-specific answers (profile basics are kept).
- Mark optional fields with "Optional". "Skip for now" appears only where every field on the step is optional.
- Show a step indicator ("Step 2 of 4") and progress; Done is not counted as a step.
- On Finish, show a brief pending state on the button, then move to Done (no network in Phase 1).

## 4. New-user-only requirement

Onboarding is shown **only to new users**. Existing users must never see the page or its workflow.

Phase 1 handling:

- Build the route so it can be wrapped by a guard: `src/components/common/require-onboarding.tsx`, which takes a `needsOnboarding: boolean` prop and either renders its children or redirects (`<Navigate replace />`) away from `/onboarding`.
- In Phase 1 the value is supplied explicitly by the route (dev-only). Do not fake gating with browser storage, query params, or hard-coded user ids.

Phase 2 handling (do not implement until requested): see section 9.

## 5. File structure

Follow the page-to-feature convention: thin route page, screen components in the feature folder, domain-neutral primitives only in `src/components/ui`.

```text
src/
  pages/onboarding/index.tsx                 thin route; composes OnboardingView
  components/common/require-onboarding.tsx   guard wrapper (see section 4)
  components/features/onboarding/
    onboarding-view.tsx                      wizard state, current step, step switch
    onboarding.schema.ts                     Zod schemas (per step + full union)
    onboarding.types.ts                      inferred types, Entity, StepId
    onboarding.constants.ts                  option lists, step metadata
    shared/
      onboarding-layout.tsx                  page shell (brand, stepper, content area)
      onboarding-stepper.tsx                 step indicator + progress
      step-actions.tsx                       Back / Skip / Next / Finish bar
    entity-select/
      entity-select-step.tsx
      entity-card.tsx
    profile-basics/profile-basics-step.tsx
    student/student-details-step.tsx
    educator/educator-details-step.tsx
    others/others-details-step.tsx
    review/review-step.tsx
    completed/onboarding-completed.tsx
```

Register the route in `src/main.tsx` alongside the existing routes. Do not restructure unrelated routes.

## 6. State and forms

- Use React Hook Form with Zod via `@hookform/resolvers/zod` (already installed).
- Prefer one form instance for the whole wizard (shared `FormProvider`), validating only the current step's fields with `trigger([...fields])` on Next. Per-step forms merged in a reducer are acceptable if simpler, but keep one source of truth.
- Model the details step as a Zod discriminated union on `entity`:

```ts
type Entity = "student" | "educator" | "others"
type OthersSubtype = "esl_teacher" | "online_tutor" | "freelance_educator"
type EducatorContext = "school_teacher" | "college_instructor"
```

- Keep step metadata (id, title, optional/required) in constants; the stepper and step actions read from it.
- Client validation is for UX. In Phase 2 the backend remains authoritative.

## 7. Visual and accessibility rules

- Reuse existing primitives in `src/components/ui` (`button`, `card`, `field`, `input`, `label`, `select`, `separator`, `spinner`). Add only what is missing (for example `radio-group`, `checkbox`, `progress`, `textarea`, `avatar`, `badge`) via `npx shadcn@latest add <name>`, then review the generated file and its imports.
- Use Tailwind v4 theme tokens from `src/styles/global.css`; no scattered hard-coded colors or one-off spacing.
- Mobile-first: entity cards stack on narrow screens and sit in a row on desktop; step actions stay reachable on small screens.
- Entity cards are a real radio group: arrow-key navigation, visible focus ring, selected state not conveyed by color alone (icon/check + text).
- On step change, move focus to the step heading.
- Stepper uses an ordered list with `aria-current="step"` on the active item.
- Every field has an associated label; errors are linked with `aria-describedby` and announced via an `aria-live="polite"` region.
- Use `lucide-react` icons for entity cards (for example `GraduationCap`, `School`, `Languages`), with decorative icons `aria-hidden`.
- Copy is short, friendly, and Owlio-branded; do not copy text from unrelated products.

## 8. Out of scope for Phase 1

API calls, auth/session checks, real avatar upload, joining a class by code, creating a classroom, OAuth, analytics, payments, and AI personalization.

## 9. Phase 2 notes (API integration — later)

Do not implement until the user asks. Confirm the contract with the backend (`owlio-api`) first; none of this exists yet.

- Gating source of truth: a nullable `onboardingCompletedAt` on the user, returned by `GET /api/auth/me` (extend `AuthUser` in `src/services/api/api.types.ts`).
- Existing users: a backend migration backfills `onboardingCompletedAt` for all accounts created before release, so they are always redirected away from `/onboarding`.
- Trigger: first successful login after email verification → `/onboarding` while `onboardingCompletedAt` is null; protected app routes redirect such users to `/onboarding`.
- Proposed endpoints: `POST /api/onboarding/complete` (and optionally `GET`/`PATCH` for drafts), using the existing CSRF pattern in `src/services/auth/auth.service.ts` and the `ApiSuccess<T>` envelope.
- Data flow: page → feature hook → TanStack Query mutation → `onboarding.service.ts` → API; invalidate the current-user query on completion.
- "Others" is stored as `EDUCATOR` plus an educator subtype field; role changes versus the registration `accountType` need an explicit backend decision.
- Frontend guards are UX only; the backend must enforce access.

## 10. Open decisions to confirm before or during Phase 1

- Final Others subtype list and the field lists for each entity.
- Destination routes after Done for each entity.
- Whether the entity choice can differ from the `accountType` picked at registration.
- Visual reference / mockups for the onboarding layout.
- Whether avatar selection belongs in onboarding or in profile settings.

## 11. Phase 1 acceptance checklist

- [ ] Each entity path (Student, Educator, Others with each subtype) can be completed to the Done screen.
- [ ] Continue is disabled until an entity is chosen; required fields block Next with field-level messages.
- [ ] Back preserves all input; Review "Edit" returns to the correct step and back to Review.
- [ ] Switching entity confirms and clears only entity-specific answers.
- [ ] Fully operable by keyboard; focus moves to each step heading; errors are announced.
- [ ] Layout works at 360px, 768px, and desktop widths.
- [ ] Onboarding makes no network requests and writes nothing to browser storage.
- [ ] Route page is thin; screen components live under `src/components/features/onboarding/`.
- [ ] `npm run lint` and `npm run build` pass.

## 12. UI inspiration direction

Use this section as a visual starting point for the onboarding UI, not as a pixel-perfect mockup. Follow Owlio's established visual cues from the shared navbar and UI primitives: a calm, polished learning workspace that feels welcoming and focused, without childish classroom clichés or a dense enterprise dashboard feel.

### Overall look and composition

- Use Inter, the Owlio wordmark/book mark, and indigo as the primary brand accent, echoing the existing navbar. Pair the accent with white or soft neutral surfaces and slate typography.
- Keep the canvas light and quiet. Use existing semantic theme tokens and shadcn Card/Button primitives, with rounded-xl surfaces, subtle borders/rings, and restrained shadows. Do not introduce a new palette or edit global theme tokens just for onboarding.
- Start with a compact brand row at the top, then center the progress indicator and the primary onboarding panel in a comfortable max-width column. Give headings and helper copy room to breathe; keep the primary action visually obvious.
- On wide screens, an optional narrow side area may show a soft abstract learning motif (open book, stacked cards, or connecting dots). Keep it decorative and secondary to the form. Hide or simplify it on small screens.
- On narrow screens, use a single-column layout, compact but readable step labels, full-width actions, and enough bottom spacing that the navigation controls are not crowded by content.

### Entity selection inspiration

Use three equal, selectable cards with a shared structure so no entity feels secondary. Each card can have a small line icon, a concise title, a one-sentence benefit, and a selected-state check. Use soft neutral card backgrounds at rest; on selection, add a clear indigo border and faint indigo tint, plus the check indicator. Keep focus styling distinct from selected styling.

Example card intent:

- **Student** — “Make space for your learning, one step at a time.” Use an open-book or graduation-cap motif.
- **Educator** — “Bring your classes and teaching workflow together.” Use a school or presentation motif.
- **Others** — “Create flexible learning experiences for every learner.” Use a languages or conversation motif.

These are copy and icon inspirations only; use the product copy specified in section 2 if it is more current. Avoid assigning a different color system or stereotyped illustration to each entity.

### Wizard step and completion inspiration

- **Profile basics:** Use a quiet form card with clearly grouped fields, concise helper text, and an optional avatar placeholder that does not look like an active upload control in Phase 1.
- **Entity details:** Keep the form structure consistent across entity variants. Use chips/tags for multi-select interests and goals, and visually separate optional prompts from required profile fields.
- **Review:** Present compact summary groups with subtle separators and small “Edit” links aligned consistently. Avoid turning the review into a dense table.
- **Done:** Use a warm, restrained celebration (for example, a book-shaped illustration or abstract stack of learning cards), a short confirmation heading, and one clear next-step CTA. Do not use success language that suggests server persistence; this remains a local Phase 1 completion state.
- Keep Back as a quiet secondary action and Continue/Finish as the indigo primary action. Maintain the same action placement from step to step where practical.

### Text wireframe (entity-selection screen)

```text
┌──────────────────────────────────────────────────────────┐
│  [book mark] owlio.                         Step 1 of 4  │
│                                                          │
│                    ● ── ○ ── ○ ── ○                     │
│                                                          │
│             Let's make Owlio yours                       │
│       First, tell us how you'll use Owlio.                │
│                                                          │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│   │ [icon]     │  │ [icon]     │  │ [icon]     │         │
│   │ Student    │  │ Educator   │  │ Others     │         │
│   │ short      │  │ short      │  │ short      │         │
│   │ benefit    │  │ benefit    │  │ benefit  ✓ │         │
│   └────────────┘  └────────────┘  └────────────┘         │
│                                                          │
│                         [ Continue → ]                   │
└──────────────────────────────────────────────────────────┘
```

Treat this as a responsive composition: stack the entity cards on mobile and keep the same card order and interaction semantics. Ensure every selection remains keyboard-operable and meets the accessibility rules in section 7.

Use this inspiration to guide implementation, not to justify adding dependencies, altering existing design tokens, or changing the onboarding content and behavior defined elsewhere in this skill.

## 13. UI implementation workflow: reference-led build

When building or refining the onboarding UI, follow this sequence. The visual references live in `public/onboarding-inspiration-design/`; inspect the actual files before coding rather than relying on memory or descriptions:

```text
public/onboarding-inspiration-design/
  one.webp
  two.webp
  three.webp
  four.webp
```

### Step 1 — Inspect the reference set and the live implementation

- View all four images together and note the recurring design patterns: a contained onboarding workspace, a compact brand/help row, segmented progress near the top, a clear heading and short supporting copy, a focused form/choice area, consistently placed Back/Next controls, and a product/illustration panel on wide screens.
- Use `three.webp` as inspiration for selectable option tiles and a highly visible selected state; map that pattern to Student, Educator, and Others, not to the reference's industry labels.
- Use `one.webp` for the split onboarding composition and progress/navigation relationship. Use `four.webp` for the restrained completion layout and one primary next action.
- `two.webp` depicts authenticator-app/QR-code setup. Owlio's current onboarding flow does not include MFA; do not add a QR code, authenticator step, or security promise based on that image. Take only reusable layout ideas such as step progress and form spacing.
- Before modifying code, inspect the current route and components in `src/pages/onboarding/`, `src/components/features/onboarding/`, `src/components/common/`, `src/components/ui/`, and `src/main.tsx`. Reuse the existing implementation and preserve unrelated or user-authored route changes. The file tree in section 5 is the intended ownership pattern, not permission to recreate working files.

### Step 2 — Translate the references into Owlio's visual language

- Treat the images as composition and interaction references, not as Owlio artwork or a request to clone another product.
- Keep the Owlio book mark/wordmark, Inter, indigo selection/action accents, neutral surfaces, and accessible color contrast from section 12 and the existing shared components. The references' black canvas, violet glow, IdeaPilot logo/copy, AI dashboard imagery, industry taxonomy, QR code, and pricing/promotional cards are not to be copied into the product UI.
- On desktop, consider a framed two-column composition: onboarding controls and content in the primary column, with a quiet Owlio learning illustration or simple branded visual in the secondary column. Keep the stepper, heading, content, and actions in the primary reading order.
- On mobile or narrow viewports, collapse to one column, hide or simplify the decorative panel, and keep progress plus Back/Continue reachable without horizontal scrolling.
- Do not render the `.webp` reference screenshots as page backgrounds or user-facing onboarding content. They are for design inspection only; do not move, rename, or edit them.

### Step 3 — Map Owlio's existing flow to the visual structure

- Preserve the four functional steps and entity-specific questions in sections 2–3: entity selection → profile basics → entity details → review, followed by the Done screen.
- Apply the reference's compact segmented progress treatment to the existing step model. Keep the accessible ordered-list/current-step semantics and textual step count specified in section 7.
- Apply the reference's selection-tile treatment to the three entity cards while retaining their real radio behavior, current Owlio copy, keyboard interaction, and selected check/state.
- Keep shared profile/detail forms visually consistent; use grouped fields, restrained separators, and optional-field labels rather than reproducing the reference's unrelated QR, dashboard, or industry controls.
- Keep the Review screen scannable with Edit actions and make Done feel complete with one role-appropriate CTA. Do not introduce reference upsells or imply server persistence.

### Step 4 — Build incrementally in the existing feature structure

- Keep route composition in `src/pages/onboarding/index.tsx`; keep wizard state and step selection in the existing onboarding view; place screen-specific UI beside its onboarding feature step; reuse shared layout, stepper, entity card, and step-action components where they already exist.
- Implement the page frame and responsive layout first, then align the stepper/header/actions, then refine the entity cards and individual form steps, then review and Done. Avoid rewriting the form schema, data model, or navigation logic solely to match a picture.
- Preserve the Phase 1 constraint: local form state only, no API requests or browser persistence. Any class-code, avatar, or classroom controls remain clearly non-functional until separately integrated.
- Before adding a UI primitive or dependency, check the existing `src/components/ui` primitives and `package.json`; follow section 7 for additions.

### Step 5 — Compare, test, and review

- Run the app and inspect `/onboarding` at desktop and narrow/mobile widths. Compare the live UI with `one.webp`–`four.webp` for composition and interaction cues, while checking the Owlio-specific adaptations above.
- Walk through every entity path and the Back/Next, validation, entity-change confirmation, Review/Edit, and Done transitions. Verify input remains intact where specified.
- Check keyboard-only use, visible focus, step announcements, radio-card semantics, field labels/errors, and reduced-width behavior. Decorative visuals must not be announced as meaningful content.
- Confirm onboarding still makes no network requests or browser-storage writes. Run `npm run lint` and `npm run build`; report any failures accurately.
- Review the final diff to ensure the change is onboarding-scoped, preserves current user changes, follows this skill's entity/flow/API boundaries, and does not copy unrelated brand or product content from the reference images.

### Reference-led UI acceptance checklist

- [ ] All four inspiration images were inspected; the relevant layout/selection/progress/completion patterns are reflected in the UI.
- [ ] Owlio branding, entity terminology, fields, and four-step workflow remain authoritative over reference content.
- [ ] The reference screenshots themselves and unrelated AI/QR/pricing elements are not shipped as onboarding UI.
- [ ] Desktop composition is balanced; mobile becomes a usable single-column flow.
- [ ] Existing components and user-authored routes are preserved unless a directly required onboarding change is approved.
- [ ] Accessibility, local-only Phase 1 behavior, lint, and build checks are verified as required above.
