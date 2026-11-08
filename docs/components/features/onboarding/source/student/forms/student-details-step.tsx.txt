import { Controller, useFormContext } from "react-hook-form"
import { KeyRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EDUCATION_LEVELS, STUDY_GOALS } from "../onboarding.constants"
import type { OnboardingFormValues } from "../onboarding.types"
import { ChoiceCheckboxGroup } from "../shared/choice-checkbox-group"
import { FieldError } from "../shared/field-error"
import { OptionalBadge } from "../shared/optional-badge"
import { TagInput } from "../shared/tag-input"

export function StudentDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const errors = form.formState.errors

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <Label htmlFor="educationLevel">Education level</Label>
        <Controller
          control={form.control}
          name="educationLevel"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="educationLevel" className="w-full rounded-lg px-3 data-[size=default]:h-11" aria-invalid={Boolean(errors.educationLevel)} aria-describedby={errors.educationLevel ? "educationLevel-error" : undefined}>
                <SelectValue placeholder="Choose your level" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError id="educationLevel-error" message={errors.educationLevel?.message} />
      </div>
      <Controller
        control={form.control}
        name="interests"
        render={({ field }) => (
          <TagInput id="interests" label="Subjects or interests" optional value={field.value ?? []} onChange={field.onChange} placeholder="Add a subject or interest" />
        )}
      />
      <ChoiceCheckboxGroup
        id="studyGoals"
        label="Study goals"
        optional
        options={STUDY_GOALS}
        value={form.watch("studyGoals") ?? []}
        onChange={(value) => form.setValue("studyGoals", value, { shouldDirty: true })}
      />
      <div className="flex gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 sm:p-5">
        <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-slate-200 sm:flex" aria-hidden="true">
          <KeyRound className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="classCode" className="flex items-center gap-2">
            Have a class code? <OptionalBadge />
          </Label>
          <Input id="classCode" placeholder="Enter a class code" className="h-11 rounded-lg bg-background px-3" aria-describedby="classCode-hint" {...form.register("classCode")} />
          <p id="classCode-hint" className="text-xs leading-5 text-muted-foreground">Joining a class happens after setup. Class-code joining is not available yet.</p>
        </div>
      </div>
    </div>
  )
}
