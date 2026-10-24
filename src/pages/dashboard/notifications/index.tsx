import { OutlineCard } from "@/components/common/outline-card"
import { pastelToneFor } from "@/components/common/outline-card-styles"
import { PageHeader } from "@/components/common/page-header"

const categories = [
  ["Classrooms", "Invitations, announcements, and classroom updates."],
  ["Learning activity", "New materials, classwork, submissions, and discussion replies."],
  ["Schedule and feedback", "Upcoming deadlines, released feedback, and supported schedule changes."],
] as const

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace updates"
        description="Relevant updates can bring invitations, classwork, deadlines, feedback, and schedule changes back to one place."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Notification categories">
        {categories.map(([title, description]) => (
          <OutlineCard key={title} tone={pastelToneFor(title)}>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
          </OutlineCard>
        ))}
      </section>
      <OutlineCard className="border-dashed p-8 text-center" aria-label="Notification inbox">
        <h3 className="text-base font-semibold">Your updates will appear here</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Notification delivery and read state are not connected, so this page is not showing live account activity.</p>
      </OutlineCard>
    </div>
  )
}
