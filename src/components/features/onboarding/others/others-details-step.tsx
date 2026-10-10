import { Controller, useFormContext } from "react-hook-form"
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
    <div className="space-y-6">
      <fieldset className="space-y-3" aria-describedby={errors.othersSubtype ? "othersSubtype-error" : undefined}>
        <legend className="text-sm font-medium">What best describes your work?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {OTHERS_SUBTYPES.map(({ value, label }) => {
            const inputId = `othersSubtype-${value}`
            return (
              <label
                key={value}
                htmlFor={inputId}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-indigo-600 ${
                  subtype === value ? "border-indigo-600 bg-indigo-50/70" : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  value={value}
                  {...form.register("othersSubtype", { onChange: () => form.setValue("learnerLevels", []) })}
                  className="size-4 accent-indigo-600"
                />
                {label}
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
