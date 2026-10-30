import type { Classroom, WorkspaceRole } from "./classroom-types"

export type ClassroomMetaCell = { label: string; value: string }
export type ClassroomStatus = { label: string; tone: "connected" | "demo" }

export function getClassroomCategory(classroom: Classroom) {
  return classroom.ownerWorkspace === 'educators' ? 'School Classes' : classroom.ownerWorkspace === 'tutors' ? 'Tutoring' : classroom.ownerWorkspace === 'esl' ? 'ESL' : 'Category unavailable'
}

export function getNextSession(classroom: Classroom) {
  const next = [...classroom.sessions].filter(item => new Date(`${item.date}T${item.time || '23:59'}`).getTime() >= Date.now())
    .sort((first, second) => `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`))[0]
  if (!next) return "-"
  return next.time ? `${next.date} · ${next.time}` : next.date
}

export function getClassroomMeta(classroom: Classroom, role: WorkspaceRole): { cells: ClassroomMetaCell[]; status: ClassroomStatus } {
  const nextSession = { label: "Next session", value: getNextSession(classroom) }

  if (role === "students") {
    return {
      cells: [{ label: "Educator", value: classroom.instructorName || "-" }, nextSession],
      status: classroom.isMock ? { label: classroom.previewStatus === 'inactive' ? 'Inactive · demo' : 'Active · demo', tone: "demo" } : { label: "Enrolled", tone: "connected" },
    }
  }

  return {
    cells: [
      { label: "Learners", value: classroom.isMock ? String(classroom.enrolledLearnerIds.length) : "-" },
      nextSession,
    ],
    status: classroom.isMock ? { label: classroom.previewStatus === 'inactive' ? 'Inactive · demo' : 'Active · demo', tone: "demo" } : { label: "Connected", tone: "connected" },
  }
}
