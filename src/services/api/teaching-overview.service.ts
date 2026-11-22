import type {
  Classroom,
  ClassroomActivity,
} from "@/components/features/classrooms/types/classroom-types";
import { listClasswork } from "./academic.service";
import { collectOperation, requestOperation } from "./contract-client";

async function mapBounded<T, U>(
  items: T[],
  map: (item: T) => Promise<U>,
): Promise<U[]> {
  const result: U[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        result[index] = await map(items[index]);
      }
    }),
  );
  return result;
}

/** Owner-only adapter for the existing activity model. No cached or sample fallback. */
export async function loadTeachingOverview(
  classrooms: Classroom[],
  signal?: AbortSignal,
): Promise<Classroom[]> {
  const result: Classroom[] = [];
  for (const classroom of classrooms) {
    const records = await listClasswork(classroom.id, signal);
    const roster = records.some((record) => record.status === "PUBLISHED")
      ? await collectOperation(
          "GET /api/v1/classrooms/{classroomId}/students",
          { params: { classroomId: classroom.id }, signal },
        )
      : [];
    const names = new Map(
      roster.map((student) => [student.studentId, student.name]),
    );
    const activities = await mapBounded(
      records,
      async (record): Promise<ClassroomActivity> => {
        const submissions =
          record.status === "PUBLISHED"
            ? await collectOperation(
                "GET /api/v1/classwork/{classworkId}/submissions",
                { params: { classworkId: record.id }, signal },
              )
            : [];
        const reviewed = await mapBounded(submissions, async (submission) => {
          const detail = await requestOperation(
            "GET /api/v1/submissions/{submissionId}",
            { params: { submissionId: submission.id }, signal },
          );
          const evaluation = await requestOperation(
            "GET /api/v1/submissions/{submissionId}/evaluation",
            { params: { submissionId: submission.id }, signal },
          );
          const released = evaluation?.status === "RELEASED";
          return {
            id: detail.id,
            learnerId: detail.studentId,
            learnerName: names.get(detail.studentId) ?? detail.studentId,
            response: detail.textAnswer,
            fileName: detail.files.length
              ? detail.files.map((file) => file.fileName).join(", ")
              : undefined,
            submittedAt: detail.submittedAt ?? "",
            status: released
              ? ("Returned" as const)
              : evaluation
                ? ("In review" as const)
                : ("Submitted" as const),
            feedback: evaluation?.feedback,
            score: evaluation?.score ?? undefined,
            released,
          };
        });
        // Activity category/response mode are presentation defaults: the API does not store them.
        return {
          id: record.id,
          title: record.title,
          type: "Assignment",
          instructions: record.instructions,
          dueDate: record.dueAt?.slice(0, 10) ?? "",
          scoringNote:
            record.maxPoints === null
              ? "Feedback only"
              : `Maximum ${record.maxPoints} points`,
          questions: [],
          responseType: "Text",
          status: record.status === "DRAFT" ? "Draft" : "Published",
          submissions: reviewed,
        };
      },
    );
    result.push({ ...classroom, activities });
  }
  return result;
}
