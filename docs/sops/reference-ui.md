# Reference UI implementation

Use when asked to implement a screenshot, mockup, reference image, or explicit visual redesign. Input is the reference plus the target route/component and request. Output is an implemented screen with visual comparison evidence and disclosed limitations.

## Inspect and define the visual target

1. View the reference itself and inspect the current target screen, route, shared shell, styles, and component APIs.
2. State whether the task asks for reproduction or inspiration. When the request says match/recreate/implement the image, use reproduction. If genuinely ambiguous, state a reasonable assumption; ask when the answer changes the task substantially.
3. Identify major regions, layout proportions, alignment, content density, spacing, type hierarchy, colors, borders, radii, shadows, icons, and imagery. Use the reference viewport/aspect ratio for the first comparison when available.
4. Identify what belongs to the requested area. A page reference does not automatically authorize redesigning every shared sidebar or auth screen.
5. Retain working actions and data sources. Identify reference-only sample content and unsupported actions before implementation.

## Implement the requested appearance

- Adapt existing primitives through variants, scoped classes, or composition. Their default sizes, fonts, and colors are not a visual specification.
- Existing theme/font/layout defaults apply to unspecified areas. A requested redesign authorizes the styling changes needed within its scope; use local styles where a global change would affect unrelated screens.
- Match large geometry and typography first, then component spacing and decorative detail. Use actual available assets where appropriate; disclose an unavailable asset rather than silently substituting a materially different design.
- Make reasonable responsive decisions where the image shows only one size. Preserve reading order, usable controls, labels, keyboard access, focus, contrast, and reduced-motion behavior.
- Preserve routes, form validation, event handlers, API-mode settings, storage formats, and permission boundaries unless their change is explicitly part of the task.
- For a requested prototype, keep fictional content visibly identified and isolate preview state. For existing connected screens, use real/empty/unavailable states and avoid replacing them with invented records to resemble the screenshot.
- A static image cannot define server saves, uploads, grades, notifications, or new permissions. Keep those actions faithful to the current/confirmed behavior.

## Render, compare, and correct

1. Run the app and open the actual target route using available browser tools. Use an existing layout-preview path when suitable; preserve global integration mode.
2. Inspect at the reference viewport. Compare overall geometry, typography, density, spacing, colors, assets, and alignment. Correct the largest visible mismatches and compare again.
3. Check a narrow viewport and relevant overflow/scroll behavior. Inspect other themes or shared screens when the change affects them.
4. Exercise the changed controls: navigation, tabs, menus, forms, dialogs, and keyboard focus as relevant. Confirm the visual work has not changed persistence or service semantics.
5. Run appropriate code checks from [verification](verification.md).

Completion requires a comparison against the reference, working supported interactions, and no known material mismatch left unreported. Report the route, viewport(s), interactions checked, and any unavailable assets or remaining differences. If browser/reference access is unavailable, state that visual fidelity is unverified; finish available checks without claiming a match.

[Agent workflow](README.md) | [Product boundaries](../product/overview.md)
