import { Controller, useFormContext } from "react-hook-form"
import { Presentation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EDUCATOR_CONTEXTS } from "../onboarding.constants"
import type { OnboardingFormValues } from "../onboarding.types"
import { FieldError } from "../shared/field-error"
import { OptionalBadge } from "../shared/optional-badge"
import { TagInput } from "../shared/tag-input"

export function EducatorDetailsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const errors = form.formState.errors

  return (
    <div className="space-y-7">
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="teachingContext">Teaching context</Label>
          <Controller
            control={form.control}
            name="teachingContext"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="teachingContext" className="w-full rounded-lg px-3 data-[size=default]:h-11" aria-invalid={Boolean(errors.teachingContext)} aria-describedby={errors.teachingContext ? "teachingContext-error" : undefined}>
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
            Institution name <OptionalBadge />
          </Label>
          <Input id="institutionName" placeholder="School, college, or organization" className="h-11 rounded-lg px-3" {...form.register("institutionName")} />
        </div>
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
      <div className="flex items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 sm:p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-slate-200" aria-hidden="true">
          <Presentation className="size-5" />
        </span>
        <div>
          <p className="flex items-center gap-2 font-medium text-foreground">Create your first classroom <OptionalBadge /></p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">Classroom creation will be available after onboarding.</p>
        </div>
      </div>
    </div>
  )
}
