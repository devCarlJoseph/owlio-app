---
name: owlio-threejs-performance
description: Profile and improve Owlio Study Spaces Three.js rendering, resource lifecycle, or scene input defects. Use for measured slowness, WebGL failures, or broken scene controls; exclude ordinary lists/forms and visual-only redesigns.
---

# Owlio Three.js performance

Improve Study Spaces scene behavior using evidence while retaining its visual and interaction goals. Use the [bug fix SOP](../../../docs/sops/bug-fix.md) for defects or the feature SOP for requested performance work.

## Locate the scene and baseline

Inspect the relevant entry points:

- [Hall world](../../../src/components/features/personal-workspace/study-spaces/study-hall-world.tsx): Canvas, explore/walk modes, camera, buildings, and hall character.
- [Room scene](../../../src/components/features/personal-workspace/study-spaces/detail/space-room-scene.tsx): seating, floor interaction, camera, and room objects.
- [Walk input](../../../src/components/features/personal-workspace/study-spaces/use-walk-keys.ts): held-key refs, typing/dialog exclusions, and blur cleanup.
- [Study Spaces view](../../../src/components/features/personal-workspace/study-spaces/study-spaces-view.tsx): scene/list selection and fallback.
- [City layout](../../../src/components/features/personal-workspace/study-spaces/city-layout.ts) and [space records](../../../src/components/features/personal-workspace/study-spaces/study-spaces-records.ts): geometry inputs versus browser-local data.

Record route/scene, viewport/device, mode, population, and repeatable interaction before optimizing. Distinguish initial load/compilation, CPU/React updates, GPU drawing, and retained resources. Use a consistent build/browser setup for before/after comparisons; development overhead is not production performance.

## Investigate and change the measured bottleneck

- Inspect frame callbacks and object allocation. Keep continuous transforms in refs/scene objects where appropriate; update React state for discrete UI changes rather than every frame.
- Check stable geometry/material/texture inputs and repeated scene objects. Consider reuse or instancing when the measured repeated geometry cost warrants it; retain selection/raycast behavior.
- Inspect shadows, device-pixel ratio, lights, overlays, and draw-call counts before reducing scene detail. Scope quality adjustments to the actual bottleneck and requested visual constraints.
- Review manually created texture/resource cleanup and cache/shared ownership. Do not blanket-dispose shared resources or assume every React Three Fiber object needs manual disposal.
- Check effect/listener teardown across scene switches and route unmounts. Use a repeated navigation observation to distinguish retained application resources from normal renderer caches.
- Preserve delta-based movement and the existing handling of resumed-frame spikes. For keyboard defects, inspect focus/dialog exclusions, held-key release, blur, and on-screen pad behavior.
- Demand rendering can help idle scenes only when animations and interactions correctly invalidate frames; do not switch frameloop modes blindly in an animated hall.
- Preserve camera controls, room navigation, seating, reduced-motion behavior, and list/WebGL fallback. Performance work does not authorize deleting core interactions or clearing stored spaces/characters.

Consult official installed-version Three.js/React Three Fiber guidance when lifecycle or renderer behavior is uncertain; avoid introducing an optimization dependency before establishing its benefit.

## Verify the result

Repeat the same baseline scenario. Report measured frame timing, render counts, load time, or memory trend only when actually observed; otherwise label the change as a hypothesis pending browser measurement.

Check explore/walk transitions, keyboard and pointer controls, seating when affected, scene exit/re-entry, and fallback behavior. jsdom tests can cover layout/input logic but cannot certify GPU rendering or frame rate. Follow [verification](../../../docs/sops/verification.md).

Deliver the bottleneck evidence, scoped change, before/after conditions/results, visual/interaction tradeoffs, and checks that remain unavailable.

## Trigger boundaries

- Use: "The Study Hall stutters when walking past many buildings"; "Movement keeps going after the window loses focus"; "Memory grows after repeatedly entering rooms."
- Skip: "Rename a study space"; "Restyle the create-space dialog"; "Change the hall's colors to match this image" without a performance/input problem.
