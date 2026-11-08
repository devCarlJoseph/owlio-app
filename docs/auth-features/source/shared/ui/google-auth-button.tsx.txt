import StackIcon from 'tech-stack-icons'
import { Button } from '@/components/ui/button'

type GoogleAuthButtonProps = {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export function GoogleAuthButton({
  onClick,
  disabled = false,
  label = 'Continue with Google',
}: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className="h-11 w-full justify-center rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-slate-50"
    >
      <StackIcon name="google" className="size-4" aria-hidden="true" />
      {label}
    </Button>
  )
}
