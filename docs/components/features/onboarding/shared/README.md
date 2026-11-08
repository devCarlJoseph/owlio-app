# shared

This directory mirrors `src/components/features/onboarding/shared/`. For the current files, proposed component folders, and manual migration checks, use the [onboarding guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/onboarding/shared/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `choice-checkbox-group.tsx`

Current file: `src/components/features/onboarding/shared/choice-checkbox-group.tsx`

```tsx
import { Check } from "lucide-react"
import { FieldError } from "./field-error"
import { OptionalBadge } from "./optional-badge"

type Choice = { value: string; label: string }

type ChoiceCheckboxGroupProps = {
  id: string
  label: string
  options: readonly Choice[]
  value: string[]
  onChange: (value: string[]) => void
  optional?: boolean
  error?: string
}

export function ChoiceCheckboxGroup({ id, label, options, value, onChange, optional, error }: ChoiceCheckboxGroupProps) {
  const errorId = `${id}-error`

  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])
  }

  return (
    <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
      <legend className="flex items-center gap-2 text-sm font-medium">
        {label}
        {optional && <OptionalBadge />}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const inputId = `${id}-${option.value}`
          const checked = value.includes(option.value)
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 has-[:focus-visible]:ring-offset-2 ${
                checked
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : error
                    ? "border-destructive/60 bg-background text-foreground hover:bg-muted/50"
                    : "border-border bg-background text-foreground hover:border-indigo-300 hover:bg-muted/40"
              }`}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className="sr-only"
              />
              <span
                className={`flex size-4 items-center justify-center rounded-full border ${
                  checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                }`}
                aria-hidden="true"
              >
                {checked && <Check className="size-3" strokeWidth={3} />}
              </span>
              {option.label}
            </label>
          )
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}
```

### `field-error.tsx`

Current file: `src/components/features/onboarding/shared/field-error.tsx`

```tsx
type FieldErrorProps = {
  id: string
  message?: string
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null
  return (
    <p id={id} className="text-sm font-medium text-destructive" role="alert" aria-live="polite">
      {message}
    </p>
  )
}
```

### `onboarding-layout.tsx`

Current file: `src/components/features/onboarding/shared/onboarding-layout.tsx`

```tsx
import type { ReactNode, RefObject } from "react"
import { BookOpenCheck, CircleHelp } from "lucide-react"
import { OwlioMascot, type OwlioMascotState } from "@/components/common/owlio-mascot/owlio-mascot"
import { OnboardingStepper } from "./onboarding-stepper"
import type { StepId } from "../onboarding.types"

type OnboardingLayoutProps = {
  activeStep?: StepId
  title: string
  description: string
  headingRef: RefObject<HTMLHeadingElement | null>
  eyebrow?: ReactNode
  children: ReactNode
  actions?: ReactNode
  mascotState?: OwlioMascotState
  mascotReplayKey?: number
}

export function OnboardingLayout({
  activeStep,
  title,
  description,
  headingRef,
  eyebrow,
  children,
  actions,
  mascotState = "idle",
  mascotReplayKey = 0,
}: OnboardingLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 sm:p-6 lg:p-8">
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl bg-background sm:min-h-[calc(100vh-3rem)] sm:rounded-3xl sm:shadow-sm sm:ring-1 sm:ring-slate-200/80 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-6 lg:p-6">
        <div className="flex min-w-0 flex-col px-5 pt-5 sm:px-8 sm:pt-7 lg:px-4 lg:pt-2">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950" aria-label="Owlio">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                <BookOpenCheck className="size-5" aria-hidden="true" />
              </span>
              <span className="text-xl">owlio<span className="text-indigo-600">.</span></span>
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <CircleHelp className="size-4" aria-hidden="true" />
              Need help?
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                Soon<span className="sr-only"> — help center coming later</span>
              </span>
            </p>
          </header>

          <OnboardingStepper activeStep={activeStep} />

          <div className="mt-3 flex items-center gap-3 lg:absolute lg:inset-y-6 lg:right-6 lg:mt-0 lg:w-[calc(41.18%-2.5rem)] lg:flex-col lg:justify-center lg:gap-3 lg:rounded-2xl lg:bg-slate-50 lg:px-6 lg:py-8 lg:text-center lg:ring-1 lg:ring-slate-200/80">
            <div className="w-24 shrink-0 sm:w-28 lg:w-full lg:max-w-72">
              <OwlioMascot state={mascotState} replayKey={mascotReplayKey} size="100%" />
            </div>
            <div className="max-w-56">
              <p className="text-sm font-semibold text-slate-900 lg:text-lg">{activeStep ? "A little setup. A great start." : "You're ready to spread your wings."}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground lg:mt-2 lg:text-sm">{activeStep ? "Make Owlio feel like your own, one step at a time." : "Here's to everything you'll learn and share."}</p>
            </div>
          </div>

          <section className="mt-4 flex flex-1 flex-col lg:mt-8" aria-labelledby="onboarding-step-heading">
            {eyebrow}
            <h1
              ref={headingRef}
              id="onboarding-step-heading"
              tabIndex={-1}
              className="rounded-md text-3xl font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-4 sm:text-4xl"
            >
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
            <div key={activeStep ?? "complete"} className="onboarding-content-enter mt-6 flex-1 pb-6">
              {children}
            </div>
            {actions && (
              <div className="sticky bottom-0 -mx-5 border-t border-border/70 bg-background px-5 py-4 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-2 lg:pb-2 lg:backdrop-blur-none">
                {actions}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
```

### `onboarding-stepper.tsx`

Current file: `src/components/features/onboarding/shared/onboarding-stepper.tsx`

```tsx
import { ONBOARDING_STEPS } from "../onboarding.constants"
import type { StepId } from "../onboarding.types"

type OnboardingStepperProps = {
  activeStep?: StepId
}

export function OnboardingStepper({ activeStep }: OnboardingStepperProps) {
  const activeIndex = activeStep ? ONBOARDING_STEPS.findIndex(({ id }) => id === activeStep) : ONBOARDING_STEPS.length

  return (
    <div className="mt-6 sm:mt-8">
      <p className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground sm:text-sm">
        {activeStep ? (
          <>
            <span>Step {activeIndex + 1} of {ONBOARDING_STEPS.length}</span>
            <span className="text-foreground sm:hidden">{ONBOARDING_STEPS[activeIndex].label}</span>
          </>
        ) : (
          <span>Setup complete</span>
        )}
      </p>
      <ol className="grid grid-cols-4 gap-2" aria-label="Onboarding progress">
        {ONBOARDING_STEPS.map(({ id, label }, index) => {
          const isActive = index === activeIndex
          const isComplete = index < activeIndex
          return (
            <li key={id} className="min-w-0" aria-current={isActive ? "step" : undefined}>
              <span
                className={`block h-1.5 rounded-full transition-colors ${
                  isActive ? "bg-indigo-600" : isComplete ? "bg-indigo-400" : "bg-slate-200"
                }`}
                aria-hidden="true"
              />
              <span
                className={`mt-2 hidden truncate text-xs sm:block ${
                  isActive ? "font-semibold text-foreground" : isComplete ? "text-slate-600" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              <span className="sr-only sm:hidden">{label}</span>
              <span className="sr-only">{isComplete ? " (completed)" : isActive ? " (current)" : ""}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
```

### `optional-badge.tsx`

Current file: `src/components/features/onboarding/shared/optional-badge.tsx`

```tsx
export function OptionalBadge() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Optional</span>
  )
}
```

### `step-actions.tsx`

Current file: `src/components/features/onboarding/shared/step-actions.tsx`

```tsx
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type StepActionsProps = {
  onBack?: () => void
  onSkip?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isFinishing?: boolean
}

export function StepActions({
  onBack,
  onSkip,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  isFinishing = false,
}: StepActionsProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      {onBack && (
        <Button type="button" variant="outline" className="h-11 flex-1 rounded-lg px-5 sm:flex-none" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back
        </Button>
      )}
      <Button
        type="button"
        className="h-11 flex-1 rounded-lg bg-indigo-600 px-6 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 sm:flex-none"
        onClick={onNext}
        disabled={nextDisabled || isFinishing}
      >
        {isFinishing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
        {isFinishing ? "Finishing…" : nextLabel}
        {!isFinishing && <ArrowRight aria-hidden="true" />}
      </Button>
      {onSkip && (
        <Button type="button" variant="ghost" className="h-11 w-full rounded-lg sm:ml-auto sm:w-auto" onClick={onSkip}>
          Skip for now
        </Button>
      )}
    </div>
  )
}
```

### `tag-input.tsx`

Current file: `src/components/features/onboarding/shared/tag-input.tsx`

```tsx
import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldError } from "./field-error"
import { OptionalBadge } from "./optional-badge"

type TagInputProps = {
  id: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  optional?: boolean
  error?: string
}

export function TagInput({ id, label, value, onChange, placeholder, optional, error }: TagInputProps) {
  const [draft, setDraft] = useState("")
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  function addTag() {
    const tag = draft.trim().replace(/,$/, "").trim()
    if (tag && !value.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) {
      onChange([...value, tag])
    }
    setDraft("")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag()
    }
    if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        {label}
        {optional && <OptionalBadge />}
      </label>
      <div
        className={`flex min-h-11 flex-wrap items-center gap-2 rounded-lg border bg-background p-1.5 shadow-xs transition focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-500/20 ${
          error ? "border-destructive" : "border-input"
        }`}
      >
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pr-1.5 pl-3 text-sm font-medium text-indigo-800 ring-1 ring-indigo-100">
            {tag}
            <button
              type="button"
              className="rounded-full p-0.5 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(" ")}
          className="h-8 min-w-32 flex-1 border-0 px-1.5 shadow-none focus-visible:ring-0 aria-invalid:ring-0"
        />
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">Press Enter or comma after each item.</p>
      <FieldError id={errorId} message={error} />
    </div>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
