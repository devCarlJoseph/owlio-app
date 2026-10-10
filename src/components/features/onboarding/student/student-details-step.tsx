import { Controller, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EDUCATION_LEVELS, STUDY_GOALS } from "../onboarding.constants"
import type { OnboardingFormValues } from "../onboarding.types"
import { ChoiceCheckboxGroup } from "../shared/choice-checkbox-group"
import { FieldError } from "../shared/field-error"
import { TagInput } from "../shared/tag-input"

export function StudentDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const errors = form.formState.errors

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="educationLevel">Education level</Label>
        <Controller
          control={form.control}
          name="educationLevel"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="educationLevel" className="w-full" aria-invalid={Boolean(errors.educationLevel)} aria-describedby={errors.educationLevel ? "educationLevel-error" : undefined}>
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
      <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
        <Label htmlFor="classCode" className="flex items-center gap-2">
          Have a class code? <span className="text-xs font-normal text-muted-foreground">Optional</span>
        </Label>
        <Input id="classCode" placeholder="Enter a class code" {...form.register("classCode")} />
        <p className="text-xs leading-5 text-muted-foreground">Joining a class happens after setup. Class-code joining is not available yet.</p>
      </div>
    </div>
  )
}
