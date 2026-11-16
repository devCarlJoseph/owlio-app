import { MessagesSquare } from "lucide-react"
import { TutorPage, TutorUnavailable } from "../../ui/tutor-workspace-ui"

export default function TutorDiscussionsView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Discussions"
      description="Keep questions and replies attached to the learner, group, session, or activity they concern."
    >
      <div className="rounded-2xl border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 surface-dark:bg-surface-blue-soft text-blue-700 surface-dark:text-blue-300">
            <MessagesSquare aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900 surface-dark:text-foreground">Contextual threads</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 surface-dark:text-muted-foreground">Thread authorship, audience, timestamps, and replies require a confirmed communication service.</p>
          </div>
        </div>
      </div>
      <TutorUnavailable
        title="Discussions are not connected"
        description="No posts or replies are loaded. Meeting Room chat stays transient and does not become a saved discussion. Direct messages are outside this plan."
      />
    </TutorPage>
  )
}
