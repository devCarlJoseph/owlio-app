import type { Classroom, WorkspaceRole } from "./classroom-types"

export type ClassroomMetaCell = { label: string; value: string }
export type ClassroomStatus = { label: string; tone: "connected" | "demo" }

export function getNextSession(classroom: Classroom) {
  const next = [...classroom.sessions].sort((first, second) => first.date.localeCompare(second.date))[0]
  if (!next) return "-"
  return next.time ? `${next.date} · ${next.time}` : next.date
}

export function getClassroomMeta(classroom: Classroom, role: WorkspaceRole): { cells: ClassroomMetaCell[]; status: ClassroomStatus } {
  const nextSession = { label: "Next session", value: getNextSession(classroom) }

  if (role === "students") {
    return {
      cells: [{ label: "Educator", value: classroom.instructorName || "-" }, nextSession],
      status: classroom.isMock ? { label: "Demo", tone: "demo" } : { label: "Enrolled", tone: "connected" },
    }
  }

  return {
    cells: [
      { label: "Learners", value: classroom.isMock ? String(classroom.enrolledLearnerIds.length) : "-" },
      nextSession,
    ],
    status: classroom.isMock ? { label: "Demo", tone: "demo" } : { label: "Connected", tone: "connected" },
  }
}
