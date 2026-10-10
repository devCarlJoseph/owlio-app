import { useFormContext } from "react-hook-form"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OnboardingFormValues } from "../onboarding.types"
import { FieldError } from "../shared/field-error"

export function ProfileBasicsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const errors = form.formState.errors

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            autoComplete="name"
            placeholder="What should we call you?"
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={errors.displayName ? "displayName-error" : undefined}
            {...form.register("displayName")}
          />
          <FieldError id="displayName-error" message={errors.displayName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Time zone</Label>
          <Input
            id="timezone"
            placeholder="e.g. America/New_York"
            aria-invalid={Boolean(errors.timezone)}
            aria-describedby={errors.timezone ? "timezone-error" : undefined}
            {...form.register("timezone")}
          />
          <FieldError id="timezone-error" message={errors.timezone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredLanguage">Preferred language</Label>
          <Input
            id="preferredLanguage"
            placeholder="e.g. English"
            aria-invalid={Boolean(errors.preferredLanguage)}
            aria-describedby={errors.preferredLanguage ? "preferredLanguage-error" : undefined}
            {...form.register("preferredLanguage")}
          />
          <FieldError id="preferredLanguage-error" message={errors.preferredLanguage?.message} />
        </div>
      </div>
      <Card className="h-fit gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-5 shadow-none ring-0">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-muted-foreground" aria-hidden="true">
          {form.watch("displayName")?.trim().charAt(0).toLocaleUpperCase() || "?"}
        </div>
        <div>
          <p className="text-sm font-medium">Avatar <span className="font-normal text-muted-foreground">Optional</span></p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Your profile image can be added later. Avatar upload is not available in this setup.</p>
        </div>
      </Card>
    </div>
  )
}
