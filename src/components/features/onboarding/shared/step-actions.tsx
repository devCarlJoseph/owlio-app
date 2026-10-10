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
    <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {onBack && (
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onBack}>
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
        )}
        {onSkip && (
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onSkip}>
            Skip for now
          </Button>
        )}
      </div>
      <Button
        type="button"
        className="w-full rounded-lg bg-indigo-600 px-5 text-white hover:bg-indigo-700 sm:w-auto"
        onClick={onNext}
        disabled={nextDisabled || isFinishing}
      >
        {isFinishing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
        {isFinishing ? "Finishing…" : nextLabel}
        {!isFinishing && <ArrowRight aria-hidden="true" />}
      </Button>
    </div>
  )
}
