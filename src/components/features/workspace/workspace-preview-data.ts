import type { WorkspaceRole } from "./workspace-types"

export type WorkspaceSection =
  | "overview"
  | "classes"
  | "classwork"
  | "assignments"
  | "assessments"
  | "materials"
  | "schedule"
  | "progress"
  | "notifications"
  | "settings"
  | "courses"
  | "attendance"
  | "grades"
  | "students"
  | "lesson-library"
  | "feedback"
  | "sessions"
  | "activities"
  | "session-notes"
  | "ai-assistant"

export type WorkspaceNavigationItem = {
  id: WorkspaceSection
  label: string
}

export const roleOptions: { id: WorkspaceRole; label: string; description: string }[] = [
  { id: "student", label: "Student", description: "Learn, plan, and track your work" },
  { id: "educator", label: "Educator", description: "Manage classes and learning" },
  { id: "esl", label: "ESL educator", description: "Plan English-language instruction" },
  { id: "tutor", label: "Tutor", description: "Coordinate tutoring sessions" },
]

export const roleNavigation: Record<WorkspaceRole, WorkspaceNavigationItem[]> = {
  student: [
    { id: "overview", label: "Overview" },
    { id: "classes", label: "My classes" },
    { id: "classwork", label: "Classwork" },
    { id: "assignments", label: "Assignments" },
    { id: "assessments", label: "Quizzes & exams" },
    { id: "materials", label: "Learning materials" },
    { id: "schedule", label: "Schedule" },
    { id: "progress", label: "Grades & progress" },
    { id: "notifications", label: "Notifications" },
    { id: "settings", label: "Settings" },
  ],
  educator: [
    { id: "overview", label: "Overview" },
    { id: "classes", label: "My classrooms" },
    { id: "courses", label: "Courses & lessons" },
    { id: "classwork", label: "Classwork" },
    { id: "assignments", label: "Assignments" },
    { id: "assessments", label: "Quizzes & exams" },
    { id: "materials", label: "Learning materials" },
    { id: "attendance", label: "Attendance" },
    { id: "grades", label: "Grades" },
    { id: "schedule", label: "Schedule" },
    { id: "students", label: "Students" },
    { id: "ai-assistant", label: "AI assistant" },
    { id: "settings", label: "Settings" },
  ],
  esl: [
    { id: "overview", label: "Overview" },
    { id: "students", label: "My students" },
    { id: "courses", label: "Classes & lessons" },
    { id: "lesson-library", label: "Lesson library" },
    { id: "materials", label: "Teaching materials" },
    { id: "schedule", label: "Session schedule" },
    { id: "attendance", label: "Attendance" },
    { id: "progress", label: "Student progress" },
    { id: "feedback", label: "Feedback & reports" },
    { id: "ai-assistant", label: "AI teaching assistant" },
    { id: "settings", label: "Settings" },
  ],
  tutor: [
    { id: "overview", label: "Overview" },
    { id: "students", label: "My students" },
    { id: "sessions", label: "Tutoring sessions" },
    { id: "schedule", label: "Schedule" },
    { id: "materials", label: "Lesson materials" },
    { id: "activities", label: "Assignments & activities" },
    { id: "progress", label: "Student progress" },
    { id: "session-notes", label: "Session notes" },
    { id: "feedback", label: "Feedback" },
    { id: "settings", label: "Settings" },
  ],
}

export const previewClasses = [
  { name: "Foundations of Biology", detail: "BIO 102 · Mon & Wed, 10:00 AM", color: "bg-emerald-100 text-emerald-700", initials: "FB" },
  { name: "Writing Workshop", detail: "ENG 204 · Tue & Thu, 1:30 PM", color: "bg-violet-100 text-violet-700", initials: "WW" },
  { name: "World History", detail: "HIS 110 · Friday, 9:00 AM", color: "bg-amber-100 text-amber-700", initials: "WH" },
]

export const previewAssignments = [
  { title: "Cell structure concept map", className: "Foundations of Biology", due: "Today · 5:00 PM", status: "Due today", tone: "bg-rose-50 text-rose-700" },
  { title: "Personal narrative draft", className: "Writing Workshop", due: "Tomorrow · 11:59 PM", status: "In progress", tone: "bg-indigo-50 text-indigo-700" },
  { title: "Primary source reflection", className: "World History", due: "Friday · 3:00 PM", status: "Not started", tone: "bg-slate-100 text-slate-600" },
]

export const sectionDetails: Partial<Record<WorkspaceSection, { title: string; description: string; nextStep: string }>> = {
  classes: { title: "Classes & learning groups", description: "Keep lessons, classwork, and shared resources connected to the people you learn with.", nextStep: "Class membership, invitations, and classroom records need a configured Owlio API." },
  classwork: { title: "Classwork", description: "A single place to find learning activities and work shared with your classes.", nextStep: "Publishing and classwork feeds are not connected to a backend yet." },
  assignments: { title: "Assignments", description: "Review due dates, submission instructions, and feedback in context.", nextStep: "Assignment creation, file uploads, and submission records need verified API contracts." },
  assessments: { title: "Quizzes & exams", description: "Find assessment instructions and understand what is coming up.", nextStep: "Question authoring, attempts, scoring, and exam delivery are not implemented." },
  materials: { title: "Learning materials", description: "Organize helpful resources alongside the class or session where they belong.", nextStep: "Resource upload and sharing require configured storage and API support." },
  schedule: { title: "Schedule", description: "See upcoming learning time and prepare for your next class or session.", nextStep: "Calendar synchronization, reminders, and time-zone-aware scheduling are not connected." },
  progress: { title: "Learning progress", description: "Keep personal goals distinct from official classroom grades and educator feedback.", nextStep: "No real grades, attendance, or progress records are available in this frontend." },
  notifications: { title: "Notifications", description: "Stay informed about class updates, upcoming work, and feedback.", nextStep: "In-app and delivery notifications require a persisted notification service." },
  settings: { title: "Workspace settings", description: "Profile, preferences, and accessibility options for your Owlio workspace.", nextStep: "Account settings are not yet connected to a signed-in profile." },
  courses: { title: "Courses & lessons", description: "Plan instructional sequences and keep classroom learning organized.", nextStep: "Course and lesson management need classroom API endpoints." },
  attendance: { title: "Attendance", description: "Review attendance in the context of a class or learning session.", nextStep: "Attendance is educator-controlled and no official attendance service is connected." },
  grades: { title: "Grades & feedback", description: "Review submitted work, educator feedback, and course outcomes.", nextStep: "Official grades and feedback must come from an authorized backend service." },
  students: { title: "Learners", description: "Keep learner context close to the classes and sessions you support.", nextStep: "Learner rosters and access management need authenticated educator APIs." },
  "lesson-library": { title: "English lesson library", description: "A future home for reusable lesson plans organized by language skill and learner level.", nextStep: "Lesson templates are not available in the current product data model." },
  feedback: { title: "Feedback & reports", description: "Capture useful next steps and keep feedback attached to a learning relationship.", nextStep: "Session notes, educator feedback, and reports are not persisted yet." },
  sessions: { title: "Tutoring sessions", description: "Coordinate one-to-one and small-group learning without requiring a school classroom.", nextStep: "Session creation, rescheduling, and conflict detection need a scheduling service." },
  activities: { title: "Practice activities", description: "Share focused practice and learning resources with tutoring students.", nextStep: "Activity assignment and completion tracking are not connected." },
  "session-notes": { title: "Session notes", description: "Keep a record of lesson focus, learner questions, and agreed next steps.", nextStep: "Notes are private educator records and need authenticated storage." },
  "ai-assistant": { title: "Teaching assistant", description: "Prepare a draft lesson or activity for educator review before it is shared.", nextStep: "No AI service is configured. Generated content is not available in this preview." },
}
