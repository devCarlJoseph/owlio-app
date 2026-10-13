---
name: owlio-onboarding
description: Guide the Owlio local onboarding wizard, entity-specific UX, validation, accessibility, and completion states.
---

# Owlio Onboarding

Use for the `/onboarding` route and its local setup workflow. Current onboarding is a client-side React Hook Form/Zod wizard; it does not save to an API or browser storage. The route currently receives `needsOnboarding={true}` explicitly, not from a server session.

## Current flow and entity model

The flow is entity selection → shared profile basics → entity details → review/edit → local Done. Current entities are `student`, `educator`, and `others`. “Others” is a UI grouping for ESL teachers, online tutors, and freelance educators; existing onboarding guidance maps it to educator plus subtype, not a separate backend role.

The current details guidance includes:

- Student: required education level; optional subjects/interests and study goals; optional class-code prompt that is not functional in the local flow.
- Educator: required teaching context and at least one subject taught; optional institution and grade/year levels; non-functional first-classroom prompt.
- Others: required subtype (ESL teacher, online tutor, or freelance educator), at least one language/subject taught, and one session format; learner levels and availability are optional.

Profile basics include required display name, timezone, and preferred language, plus an optional visual-only avatar placeholder. Confirm the current schema/constants before changing field requirements or options.

## Navigation and accessibility

Preserve input between steps; validate the current step on Next, never block Back, and when switching entity after details have been entered, confirm and clear only entity-specific answers. Review/Edit returns to the selected step; Done is not counted as a wizard step.

Keep a visible textual step count and accessible stepper; entity selection must be a keyboard-operable radio group with a clear selected state. Associate labels and errors, announce validation feedback, and move focus to the new step heading. Keep actions reachable on mobile and mark optional fields explicitly.

## Scope boundaries

- Keep the flow local unless API integration is explicitly requested and backend contracts are confirmed.
- Do not claim onboarding completion was saved or that the route is a real auth/session guard.
- Do not make class joining, classroom creation, avatar upload, OAuth, or persistence functional without an approved contract.
- Registration currently uses `student`/`teacher`/`other`; do not silently align it with onboarding's `student`/`educator`/`others`.
- Confirm role-appropriate Done destinations before replacing placeholders.
- When using `public/onboarding-inspiration-design/`, treat screenshots as composition references only. Keep Owlio terminology/branding and do not add MFA/QR steps or unrelated demo content from references.

Use [Owlio Core](../owlio-core/SKILL.md) for shared security/accessibility conventions and [authentication](../owlio-authentication/SKILL.md) for the separate account-creation flow.