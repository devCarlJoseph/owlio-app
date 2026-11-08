import { MessagesSquare } from "lucide-react"
import { TutorPage, TutorUnavailable } from "../tutor-workspace-ui"

export default function TutorDiscussionsView() {
  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Discussions"
      description="Keep questions and replies attached to the learner, group, session, or activity they concern."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <MessagesSquare aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">Contextual threads</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Thread authorship, audience, timestamps, and replies require a confirmed communication service.</p>
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
