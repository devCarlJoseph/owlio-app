import { GraduationCap, School } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldError } from "@/components/ui/field"
import type { RegisterValues } from "./register.schema"

const accountTypes = [
  { value: "student", label: "Student", description: "For learners", Icon: GraduationCap },
  { value: "educator", label: "Educator", description: "Teachers, tutors, and ESL educators", Icon: School },
] as const

export function AccountTypeSelector() {
  const form = useFormContext<RegisterValues>()
  const error = form.formState.errors.accountType?.message

  return (
    <fieldset className="space-y-2" aria-describedby={error ? "accountType-error" : undefined}>
      <legend className="mb-2 text-sm font-medium text-slate-600">I am joining Owlio as <span className="text-destructive">*</span></legend>
      <Controller
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2">
            {accountTypes.map(({ value, label, description, Icon }) => (
              <label
                key={value}
                htmlFor={`accountType-${value}`}
                className={`flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-lg border p-3 transition focus-within:ring-2 focus-within:ring-blue-500/20 ${
                  field.value === value ? "border-blue-500 bg-blue-50/70" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5">
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
                    className="size-3.5 shrink-0 accent-blue-600"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "accountType-error" : undefined}
                  />
                  <Icon className="size-3.5 shrink-0 text-blue-700" aria-hidden="true" />
                  <span className="truncate text-sm font-semibold text-slate-800">{label}</span>
                </span>
                <span className="pl-5 text-[11px] leading-4 text-slate-500">{description}</span>
              </label>
            ))}
          </div>
        )}
      />
      <FieldError id="accountType-error" errors={[error ? { message: error } : undefined]} />
    </fieldset>
  )
}
