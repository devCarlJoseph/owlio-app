import { OwlioOwl } from './owlio-owl'
import type { AuthShowcaseContext } from './auth-showcase-content'

const copy: Record<AuthShowcaseContext, { title: string; description: string }> = {
  login: { title: 'Welcome to your learning space.', description: 'Sign in to access your classes, personal learning, and scheduled sessions.' },
  register: { title: 'Start learning with Owlio.', description: 'Create an account, verify your email, and build your learning space.' },
  'forgot-password': { title: 'Recover your account.', description: 'We will send recovery instructions if your email matches an account.' },
  'email-verification': { title: 'Verify your email.', description: 'Use the verification instructions sent to your email to activate your account.' },
  'password-reset': { title: 'Secure your account.', description: 'Choose a strong password. Sign in again after your password has been reset.' },
}
export function AuthShowcase({ context }: { context: AuthShowcaseContext }) {
  return <aside aria-label="About Owlio" className="relative hidden h-full flex-col items-center justify-center gap-8 overflow-hidden rounded-[28px] bg-linear-to-br from-blue-500 to-indigo-700 p-8 text-center text-white lg:flex">
    <OwlioOwl className="w-full max-w-80" />
    <div className="max-w-md space-y-3"><h2 className="text-2xl font-semibold">{copy[context].title}</h2><p className="text-sm leading-6 text-blue-50">{copy[context].description}</p></div>
    <p className="text-xs text-blue-100">Students · Educators · Tutors · ESL teachers</p>
  </aside>
}
