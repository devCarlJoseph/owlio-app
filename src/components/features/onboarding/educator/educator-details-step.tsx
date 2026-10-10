import { Controller, useFormContext } from "react-hook-form"
import { ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EDUCATOR_CONTEXTS } from "../onboarding.constants"
import type { OnboardingFormValues } from "../onboarding.types"
import { FieldError } from "../shared/field-error"
import { TagInput } from "../shared/tag-input"

export function EducatorDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const errors = form.formState.errors

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="teachingContext">Teaching context</Label>
        <Controller
          control={form.control}
          name="teachingContext"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="teachingContext" className="w-full" aria-invalid={Boolean(errors.teachingContext)} aria-describedby={errors.teachingContext ? "teachingContext-error" : undefined}>
                <SelectValue placeholder="Choose your teaching context" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATOR_CONTEXTS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError id="teachingContext-error" message={errors.teachingContext?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="institutionName" className="flex items-center gap-2">
          Institution name <span className="text-xs font-normal text-muted-foreground">Optional</span>
        </Label>
        <Input id="institutionName" placeholder="School, college, or organization" {...form.register("institutionName")} />
      </div>
      <Controller
        control={form.control}
        name="subjectsTaught"
        render={({ field }) => (
          <TagInput id="subjectsTaught" label="Subjects taught" value={field.value ?? []} onChange={field.onChange} placeholder="Add a subject" error={errors.subjectsTaught?.message} />
        )}
      />
      <Controller
        control={form.control}
        name="gradeLevels"
        render={({ field }) => (
          <TagInput id="gradeLevels" label="Grade or year levels" optional value={field.value ?? []} onChange={field.onChange} placeholder="Add a grade or year level" />
        )}
      />
      <Card className="flex-row items-start gap-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-none ring-0 sm:p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-700" aria-hidden="true">
          <ArrowUpRight className="size-5" />
        </span>
        <div>
          <p className="font-medium text-foreground">Create your first classroom</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">Classroom creation will be available after onboarding.</p>
        </div>
      </Card>
    </div>
  )
}
