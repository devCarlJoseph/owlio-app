---
name: owlio-reference-ui
description: Reproduce supplied UI images in Owlio and diagnose visual mismatches using rendered comparisons. Use for screenshot/mockup implementation; exclude copy-only edits and general feature work without a visual reference.
---

# Owlio reference UI

Turn a visual reference into the requested Owlio screen with observable comparison evidence. Use the [reference UI SOP](../../../docs/sops/reference-ui.md) for task flow; this skill adds measurement and implementation techniques.

## Establish the visual target

Identify the target route/component, affected workspace, reference image, and reproduction versus inspiration intent. View the image itself. If it is inaccessible, request the missing reference and continue independent source inspection; do not reconstruct an unseen image from assumptions.

Identify the image's main regions and their relative dimensions before editing. Record a compact set of visual acceptance points: shell/content widths, columns, vertical rhythm, type hierarchy, card/control dimensions, surface colors, and key assets. Treat exact font/size estimates as uncertain when the image has been scaled.

Inspect the [route entry](../../../src/main.tsx), [dashboard shell](../../../src/pages/dashboard/layout.tsx), target view, and relevant [UI primitives](../../../src/components/ui) only. Read [frontend UI conventions](../../../docs/architecture/frontend.md#ui-and-reference-images) when shared styling is affected.

## Adapt the implementation

- Match overall geometry and density first, typography next, then borders, shadows, icons, and decorative details. Fix container sizing before compensating with many child margins.
- Inspect primitive variants and internal markup. Base UI wrappers do not imply Radix APIs; a default Button/Card appearance can be changed to match the reference.
- Scope reference-specific CSS/variants to the target. Change shared tokens or the dashboard shell only when the requested design includes those shared surfaces.
- Preserve real controls, handlers, validation, and storage. For purely visual references, keep unsupported actions unavailable or visibly illustrative according to the existing mode.
- Use the reference's composition rather than adding unsolicited dashboards, gradients, cards, or metrics. Make responsive adaptations that preserve hierarchy where only one viewport is supplied.
- Inspect [global styles](../../../src/styles/global.css) and [dark compatibility styles](../../../src/styles/dark-surfaces.css) when colors appear overridden. Check authored-content exceptions before changing global theme selectors.

## Compare in the browser

Use available browser tooling and read its control instructions; do not assume a particular automation package is installed. Reuse an existing development server when suitable, or run `npm run dev` and use the URL it actually prints. On Windows use `npm.cmd` if needed.

Open the actual target route with the appropriate preview state. Preserve [API mode](../../../src/lib/api-mode.ts); changing global enablement is not required for styling. Meeting Room has layout-preview handling in its view; inspect that route before using it.

At the reference viewport, compare the same visible region and scroll position. Inspect rendered output, not only the DOM. Use a short mismatch list in descending visual impact; correct and compare again. Overlay/difference images are optional aids, not proof by themselves when content, font rendering, or scale differs.

Check narrow-screen overflow, text wrapping, scrolling, and changed controls. Inspect other themes/shared consumers when the patch affects them. Avoid claiming pixel accuracy from a passing build.

## Completion evidence

Report the target route, viewport(s), material mismatches corrected, supported interactions exercised, and remaining asset/layout differences. Follow [verification](../../../docs/sops/verification.md) for code checks. If browser rendering is unavailable, report visual fidelity as unverified.

## Trigger boundaries

- Use: "Recreate the attached student library screenshot"; "The implemented meeting layout does not match this mockup."
- Skip: "Fix the login CSRF retry"; "Change this button's text." A screenshot used only to show a behavioral error does not automatically make this a visual task.
