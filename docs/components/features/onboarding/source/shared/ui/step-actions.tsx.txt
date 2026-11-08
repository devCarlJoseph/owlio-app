import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type StepActionsProps = {
  onBack?: () => void
  onSkip?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  isFinishing?: boolean
}

export function StepActions({
  onBack,
  onSkip,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  isFinishing = false,
}: StepActionsProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      {onBack && (
        <Button type="button" variant="outline" className="h-11 flex-1 rounded-lg px-5 sm:flex-none" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back
        </Button>
      )}
      <Button
        type="button"
        className="h-11 flex-1 rounded-lg bg-indigo-600 px-6 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 sm:flex-none"
        onClick={onNext}
        disabled={nextDisabled || isFinishing}
      >
        {isFinishing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
        {isFinishing ? "Finishing…" : nextLabel}
        {!isFinishing && <ArrowRight aria-hidden="true" />}
      </Button>
      {onSkip && (
        <Button type="button" variant="ghost" className="h-11 w-full rounded-lg sm:ml-auto sm:w-auto" onClick={onSkip}>
          Skip for now
        </Button>
      )}
    </div>
  )
}
