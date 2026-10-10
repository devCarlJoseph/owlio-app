import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { AuthFeedback } from "./auth-feedback"

type SessionExpiredStateProps = {
  onReturn: () => void
}

export function SessionExpiredState({ onReturn }: SessionExpiredStateProps) {
  return (
    <div className="space-y-5">
      <AuthFeedback title="Your session has ended" preview>
        This is a sign-in screen preview. No session was checked or ended here.
      </AuthFeedback>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={onReturn}>Return to sign in</Button>
        <Button type="button" variant="outline" render={<Link to="/auth/forgot-password" />}>Reset password</Button>
      </div>
    </div>
  )
}
