import { GraduationCap, School } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldError } from "@/components/ui/field"
import type { RegisterValues } from "./register.schema"

const accountTypes = [
  { value: "student", label: "Student", description: "Build your personal learning space.", Icon: GraduationCap },
  { value: "educator", label: "Educator", description: "Bring your teaching workflow together.", Icon: School },
] as const

export function AccountTypeSelector() {
  const form = useFormContext<RegisterValues>()
  const error = form.formState.errors.accountType?.message

  return (
    <fieldset className="space-y-3" aria-describedby={error ? "accountType-error" : undefined}>
      <legend className="text-sm font-medium">I am joining Owlio as <span className="text-destructive">*</span></legend>
      <Controller
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <div className="grid gap-3 sm:grid-cols-2">
            {accountTypes.map(({ value, label, description, Icon }) => (
              <label
                key={value}
                htmlFor={`accountType-${value}`}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-ring/50 ${
                  field.value === value ? "border-indigo-600 bg-indigo-50/60" : "border-border hover:bg-muted/30"
                }`}
              >
                <input
                  id={`accountType-${value}`}
                  type="radio"
                  required
                  name={field.name}
                  value={value}
                  checked={field.value === value}
                  onChange={() => field.onChange(value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="mt-0.5 size-4 accent-indigo-600"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "accountType-error" : undefined}
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-indigo-700" aria-hidden="true" />{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      />
      <FieldError id="accountType-error" errors={[error ? { message: error } : undefined]} />
    </fieldset>
  )
}
