import type { NotificationItemViewModel, NotificationsRole } from "./notifications.types"

type Example = Omit<NotificationItemViewModel, "id" | "example" | "timestamp">

const examples: Record<NotificationsRole, Example[]> = {
  students: [
    { actor: "Your educator", initials: "ED", action: "Shared classwork in", context: "Your classroom", preview: "An example of how a new learning activity could appear in your notifications.", category: "activity", unread: true, destination: { href: "/students/classwork", label: "Open classwork workspace" } },
    { actor: "Classroom update", initials: "CL", action: "Shared an update for", context: "An educator-led class", preview: "Class announcements stay attached to the classroom they belong to.", category: "classroom", unread: true, destination: { href: "/students/classrooms", label: "Open classrooms workspace" } },
    { actor: "Learning schedule", initials: "SC", action: "A deadline update for", context: "Assigned classwork", preview: "Personal plans remain separate from educator-assigned deadlines.", category: "schedule", unread: true, destination: { href: "/students/schedule", label: "Open schedule workspace" } },
    { actor: "Your educator", initials: "ED", action: "Published feedback for", context: "A learning activity", preview: "Only feedback deliberately released to you belongs in this view.", category: "feedback", unread: false, destination: { href: "/students/classwork", label: "Open classwork workspace" } },
    { actor: "Study community", initials: "SP", action: "Shared a peer update in", context: "A study space", preview: "Student-created peer learning stays distinct from official classroom records.", category: "community", unread: false, destination: { href: "/students/study-spaces", label: "Open study spaces workspace" } },
  ],
  educators: [
    { actor: "Classwork update", initials: "CW", action: "A submission update for", context: "Your classroom activity", preview: "An example of a review notification from a class you are authorized to manage.", category: "activity", unread: true, destination: { href: "/educators/classwork", label: "Open classwork workspace" } },
    { actor: "Classroom update", initials: "CL", action: "Shared an update in", context: "Your teaching classroom", preview: "Classroom updates link back to their own teaching context.", category: "classroom", unread: true, destination: { href: "/educators/classrooms", label: "Open classrooms workspace" } },
    { actor: "Teaching schedule", initials: "SC", action: "A schedule update for", context: "A class session", preview: "Teaching appointments and assessment deadlines retain their source context.", category: "schedule", unread: true, destination: { href: "/educators/schedule", label: "Open schedule workspace" } },
    { actor: "Class discussion", initials: "CD", action: "A discussion update in", context: "Your classroom", preview: "A contextual discussion update can bring you back to the conversation.", category: "community", unread: false, destination: { href: "/educators/communication", label: "Open communication workspace" } },
    { actor: "Assessment update", initials: "AS", action: "A review update for", context: "Classwork & assessments", preview: "Review activity stays separate from final grades and publication decisions.", category: "activity", unread: false, destination: { href: "/educators/classwork", label: "Open classwork workspace" } },
  ],
  tutors: [
    { actor: "Session update", initials: "SE", action: "A schedule update for", context: "Individual tutoring", preview: "An example of a session notification without exposing learner details.", category: "schedule", unread: true, destination: { href: "/tutors/sessions", label: "Open sessions workspace" } },
    { actor: "Activity update", initials: "AC", action: "A learner activity update in", context: "Activities & evaluations", preview: "Tutoring evaluations stay distinct from institutional grades.", category: "activity", unread: true, destination: { href: "/tutors/classwork", label: "Open activities workspace" } },
    { actor: "Group session", initials: "GR", action: "Shared an update for", context: "Group tutoring", preview: "Group sessions keep their own learner and learning context.", category: "community", unread: true, destination: { href: "/tutors/sessions", label: "Open sessions workspace" } },
    { actor: "Published feedback", initials: "FB", action: "A feedback update for", context: "A tutoring activity", preview: "Published learner feedback is separate from private tutor notes.", category: "feedback", unread: false, destination: { href: "/tutors/classwork", label: "Open activities workspace" } },
    { actor: "Learning discussion", initials: "LD", action: "A discussion update in", context: "Your tutoring context", preview: "Discussions stay connected to the learning work they concern.", category: "community", unread: false, destination: { href: "/tutors/communication", label: "Open discussions workspace" } },
  ],
  esl: [
    { actor: "Lesson update", initials: "LE", action: "A schedule update for", context: "An individual lesson", preview: "An example of a dated language lesson update, separate from reusable Lesson Plans.", category: "schedule", unread: true, destination: { href: "/esl/schedule", label: "Open lesson schedule workspace" } },
    { actor: "Language activity", initials: "LA", action: "An activity update in", context: "Language practice", preview: "Language activities keep their lesson and learner context.", category: "activity", unread: true, destination: { href: "/esl/classwork", label: "Open activities workspace" } },
    { actor: "Group lesson", initials: "GR", action: "Shared an update for", context: "Group language learning", preview: "Individual and group lesson updates remain clearly identified.", category: "community", unread: true, destination: { href: "/esl/schedule", label: "Open lesson schedule workspace" } },
    { actor: "Published feedback", initials: "FB", action: "A feedback update for", context: "A language activity", preview: "Published feedback stays separate from private teaching notes and inferred proficiency.", category: "feedback", unread: false, destination: { href: "/esl/classwork", label: "Open activities workspace" } },
    { actor: "Lesson discussion", initials: "LD", action: "A discussion update in", context: "Your lesson context", preview: "Lesson conversations link to their authorized learning context.", category: "community", unread: false, destination: { href: "/esl/communication", label: "Open communication workspace" } },
  ],
}

export function getNotificationExamples(role: NotificationsRole): NotificationItemViewModel[] {
  return examples[role].map((item, index) => ({ ...item, id: `${role}-example-${index}`, example: true }))
}
