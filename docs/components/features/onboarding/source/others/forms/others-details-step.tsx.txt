import { Controller, useFormContext } from "react-hook-form"
import { Check } from "lucide-react"
import { CEFR_LEVELS, GENERAL_LEARNER_LEVELS, OTHERS_SUBTYPES, SESSION_FORMATS } from "../onboarding.constants"
import type { OnboardingFormValues } from "../onboarding.types"
import { ChoiceCheckboxGroup } from "../shared/choice-checkbox-group"
import { FieldError } from "../shared/field-error"
import { TagInput } from "../shared/tag-input"

export function OthersDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const errors = form.formState.errors
  const subtype = form.watch("othersSubtype")
  const learnerOptions = (subtype === "esl_teacher" ? CEFR_LEVELS : GENERAL_LEARNER_LEVELS).map((value) => ({ value, label: value }))

  return (
    <div className="space-y-7">
      <fieldset className="space-y-3" aria-describedby={errors.othersSubtype ? "othersSubtype-error" : undefined}>
        <legend className="text-sm font-medium">What best describes your work?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {OTHERS_SUBTYPES.map(({ value, label }) => {
            const inputId = `othersSubtype-${value}`
            const checked = subtype === value
            return (
              <label
                key={value}
                htmlFor={inputId}
                className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 has-[:focus-visible]:ring-offset-2 ${
                  checked
                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-1 ring-indigo-600"
                    : errors.othersSubtype
                      ? "border-destructive/60 bg-background hover:bg-muted/40"
                      : "border-border bg-slate-50/60 hover:border-indigo-300 hover:bg-white"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  value={value}
                  {...form.register("othersSubtype", { onChange: () => form.setValue("learnerLevels", []) })}
                  className="sr-only"
                />
                {label}
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </label>
            )
          })}
        </div>
        <FieldError id="othersSubtype-error" message={errors.othersSubtype?.message} />
      </fieldset>
      <Controller
        control={form.control}
        name="languagesOrSubjects"
        render={({ field }) => (
          <TagInput id="languagesOrSubjects" label="Languages or subjects taught" value={field.value ?? []} onChange={field.onChange} placeholder="Add a language or subject" error={errors.languagesOrSubjects?.message} />
        )}
      />
      <ChoiceCheckboxGroup
        id="learnerLevels"
        label="Learner levels"
        optional
        options={learnerOptions}
        value={form.watch("learnerLevels") ?? []}
        onChange={(value) => form.setValue("learnerLevels", value, { shouldDirty: true })}
      />
      <ChoiceCheckboxGroup
        id="sessionFormats"
        label="Session formats"
        options={SESSION_FORMATS}
        value={form.watch("sessionFormats") ?? []}
        onChange={(value) => form.setValue("sessionFormats", value, { shouldDirty: true })}
        error={errors.sessionFormats?.message}
      />
      <Controller
        control={form.control}
        name="availability"
        render={({ field }) => (
          <TagInput id="availability" label="Typical availability" optional value={field.value ?? []} onChange={field.onChange} placeholder="Add a weekday or time of day" />
        )}
      />
      <p className="sr-only" aria-live="polite">
        {subtype === "esl_teacher" ? "Learner levels: CEFR A1 to C2." : "Learner levels: beginner, intermediate, and advanced."}
      </p>
    </div>
  )
}
