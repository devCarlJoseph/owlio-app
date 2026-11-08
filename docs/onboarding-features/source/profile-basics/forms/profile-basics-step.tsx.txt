import { useFormContext } from "react-hook-form"
import { UserRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OnboardingFormValues } from "../onboarding.types"
import { FieldError } from "../shared/field-error"
import { OptionalBadge } from "../shared/optional-badge"

export function ProfileBasicsStep() {
  const form = useFormContext<OnboardingFormValues>()
  const errors = form.formState.errors
  const initial = form.watch("displayName")?.trim().charAt(0).toLocaleUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 sm:p-5">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-700 ring-4 ring-white"
          aria-hidden="true"
        >
          {initial || <UserRound className="size-6" />}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium">Avatar <OptionalBadge /></p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Your profile image can be added later. Avatar upload is not available in this setup.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          autoComplete="name"
          placeholder="What should we call you?"
          className="h-11 rounded-lg px-3"
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={errors.displayName ? "displayName-error" : undefined}
          {...form.register("displayName")}
        />
        <FieldError id="displayName-error" message={errors.displayName?.message} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Time zone</Label>
          <Input
            id="timezone"
            placeholder="e.g. America/New_York"
            className="h-11 rounded-lg px-3"
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
            className="h-11 rounded-lg px-3"
            aria-invalid={Boolean(errors.preferredLanguage)}
            aria-describedby={errors.preferredLanguage ? "preferredLanguage-error" : undefined}
            {...form.register("preferredLanguage")}
          />
          <FieldError id="preferredLanguage-error" message={errors.preferredLanguage?.message} />
        </div>
      </div>
    </div>
  )
}
