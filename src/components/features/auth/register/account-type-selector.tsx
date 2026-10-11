import { GraduationCap, School, Users } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldError } from "@/components/ui/field"
import type { RegisterValues } from "./register.schema"

const accountTypes = [
  { value: "student", label: "Student", description: "For learners", Icon: GraduationCap },
  { value: "teacher", label: "Teacher", description: "For classrooms", Icon: School },
  { value: "other", label: "Other", description: "Tutors, ESL teachers & more", Icon: Users },
] as const

export function AccountTypeSelector() {
  const form = useFormContext<RegisterValues>()
  const error = form.formState.errors.accountType?.message

  return (
    <fieldset className="space-y-2" aria-describedby={error ? "accountType-error" : undefined}>
      <legend className="mb-2 text-xs font-medium text-slate-700">I am joining Owlio as <span className="text-destructive">*</span></legend>
      <Controller
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <div className="grid grid-cols-3 gap-2">
            {accountTypes.map(({ value, label, description, Icon }) => (
              <label
                key={value}
                htmlFor={`accountType-${value}`}
                className={`flex min-w-0 cursor-pointer flex-col gap-2 rounded-lg border p-2.5 transition focus-within:ring-2 focus-within:ring-ring/50 sm:p-3 ${
                  field.value === value ? "border-blue-500 bg-blue-50/70" : "border-slate-300 hover:bg-slate-50"
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
                  <span className="truncate text-[11px] font-semibold text-slate-800">{label}</span>
                </span>
                <span className="pl-5 text-[9px] leading-4 text-slate-500 sm:pl-5 sm:text-[10px]">{description}</span>
              </label>
            ))}
          </div>
        )}
      />
      <FieldError id="accountType-error" errors={[error ? { message: error } : undefined]} />
    </fieldset>
  )
}
