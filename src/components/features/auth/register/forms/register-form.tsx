import { Link } from "react-router"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { AuthPasswordInput } from "../../shared/ui/auth-password-input"
import { authInputClassName, authLinkClassName, authPrimaryButtonClassName } from "../../shared/utils/auth-input-styles"
import { PasswordGuidance } from "../../shared/ui/password-guidance"
import { GoogleAuthButton } from "../../shared/ui/google-auth-button"
import { AccountTypeSelector } from "../ui/account-type-selector"
import type { RegisterValues } from "../schemas/register.schema"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AccountType } from "@/services/api/api.types"

type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => void
  onGoogle: (accountType: AccountType) => void
  googlePending: boolean
  googleOnly?: boolean
  onUseEmail?: () => void
}

export function RegisterForm({ onSubmit, onGoogle, googlePending, googleOnly = false, onUseEmail }: RegisterFormProps) {
  const form = useFormContext<RegisterValues>()
  const errors = form.formState.errors

  const continueWithGoogle = () => {
    if (googlePending || form.formState.isSubmitting) return
    const accountType = form.getValues('accountType')
    const termsAccepted = form.getValues('acceptTerms')
    if (!accountType) {
      form.setError('accountType', { type: 'manual', message: 'Choose an account type to continue with Google.' })
      return
    }
    if (!termsAccepted) {
      form.setError('acceptTerms', { type: 'manual', message: 'Accept the terms to continue.' })
      return
    }
    form.clearErrors(['accountType', 'acceptTerms'])
    onGoogle(accountType)
  }

  return (
    <form noValidate onSubmit={googleOnly ? (event) => { event.preventDefault(); continueWithGoogle() } : form.handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="gap-3.5">
        {!googleOnly && <>
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="sr-only">Full name</Label>
            <Input id="fullName" autoComplete="name" placeholder="Enter your full name" required aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "fullName-error" : undefined} className={authInputClassName} {...form.register("fullName")} />
            <FieldError id="fullName-error" errors={[errors.fullName]} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="registerEmail" className="sr-only">Email</Label>
            <Input id="registerEmail" type="email" autoComplete="email" placeholder="Enter your email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "registerEmail-error" : undefined} className={authInputClassName} {...form.register("email")} />
            <FieldError id="registerEmail-error" errors={[errors.email]} />
          </div>
        </>}
        <AccountTypeSelector />
        {!googleOnly && <>
          <div className="space-y-1.5">
            <AuthPasswordInput id="registerPassword" label="Password" placeholder="Create a password" autoComplete="new-password" registration={form.register("password")} error={errors.password?.message} />
            <PasswordGuidance />
          </div>
          <AuthPasswordInput id="passwordConfirmation" label="Confirm password" placeholder="Confirm your password" autoComplete="new-password" registration={form.register("passwordConfirmation")} error={errors.passwordConfirmation?.message} />
        </>}
        <div className="space-y-1.5">
          <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-2 text-sm leading-5 text-slate-600 surface-dark:text-muted-foreground">
            <input id="acceptTerms" type="checkbox" required className="mt-0.5 size-4 shrink-0 rounded accent-blue-600" aria-invalid={Boolean(errors.acceptTerms)} aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined} {...form.register("acceptTerms")} />
            <span>I agree to the Terms of Service and Privacy Policy <span className="text-destructive">*</span></span>
          </label>
          <FieldError id="acceptTerms-error" errors={[errors.acceptTerms]} />
        </div>
      </FieldGroup>
      <div className="space-y-5">
        <p className="text-center text-xs text-slate-500 surface-dark:text-muted-foreground">{googleOnly ? 'Choose your role and accept the terms, then continue with Google.' : 'Or continue without an Owlio password. Choose a role and accept the terms above.'}</p>
        <GoogleAuthButton onClick={continueWithGoogle} disabled={googlePending || form.formState.isSubmitting} label={googlePending ? 'Connecting to Google…' : 'Sign up with Google'} />
      </div>
      {!googleOnly && <Button type="submit" disabled={form.formState.isSubmitting || googlePending} className={authPrimaryButtonClassName}>{form.formState.isSubmitting ? 'Creating account…' : 'Create account'}</Button>}
      {googleOnly && <Button type="button" variant="link" disabled={googlePending} onClick={onUseEmail}>Sign up with email instead</Button>}
      <p className="text-center text-sm text-slate-500 surface-dark:text-muted-foreground">
        Already have an account? <Link to="/login" state={googleOnly ? { connectGoogle: true, oauthNotice: 'Log in with your Owlio password, then select Connect Google on the next screen.' } : undefined} className={authLinkClassName}>{googleOnly ? 'Log in to connect Google' : 'Log in'}</Link>
      </p>
    </form>
  )
}
