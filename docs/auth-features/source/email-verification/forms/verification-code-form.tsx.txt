import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authInputClassName, authPrimaryButtonClassName } from '../shared/auth-input-styles'
import { verifyEmailCodeSchema, type VerifyEmailCodeValues } from './email-verification.schema'

type VerificationCodeFormProps = {
  initialEmail: string
  submitting: boolean
  resendCooldownSeconds: number
  onSubmit: (values: VerifyEmailCodeValues) => Promise<void>
  onResend: (email: string) => Promise<void>
}

export function VerificationCodeForm({
  initialEmail,
  submitting,
  resendCooldownSeconds,
  onSubmit,
  onResend,
}: VerificationCodeFormProps) {
  const form = useForm<VerifyEmailCodeValues>({
    resolver: zodResolver(verifyEmailCodeSchema),
    defaultValues: { email: initialEmail, code: '' },
    mode: 'onTouched',
  })
  const errors = form.formState.errors

  const resend = async () => {
    if (!await form.trigger('email')) return
    const email = form.getValues('email')
    await onResend(email)
    form.setValue('code', '')
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup className="gap-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="verificationEmail">Email</Label>
            <Input
              id="verificationEmail"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'verificationEmail-error' : undefined}
              className={authInputClassName}
              {...form.register('email')}
            />
            <FieldError id="verificationEmail-error" errors={[errors.email]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Six-digit code</Label>
            <Controller
              control={form.control}
              name="code"
              render={({ field }) => (
                <InputOTP
                  id="verificationCode"
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="^[0-9]*$"
                  aria-label="Six-digit verification code"
                  aria-invalid={Boolean(errors.code)}
                  aria-describedby={errors.code ? 'verificationCode-error' : undefined}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FieldError id="verificationCode-error" errors={[errors.code]} />
          </div>
        </FieldGroup>
        <Button type="submit" disabled={submitting || form.formState.isSubmitting} className={authPrimaryButtonClassName}>
          {submitting || form.formState.isSubmitting ? 'Verifying…' : 'Verify email'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={resendCooldownSeconds > 0 || form.formState.isSubmitting}
          onClick={() => void resend()}
          className="w-full text-sm text-slate-600"
        >
          {resendCooldownSeconds > 0 ? `Resend code in ${resendCooldownSeconds}s` : 'Resend code'}
        </Button>
      </form>
    </FormProvider>
  )
}
