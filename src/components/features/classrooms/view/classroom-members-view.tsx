import { ClassroomMembersSkeleton } from "../ui/classroom-skeletons";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/components/features/auth/context/auth-session-context";
import { getApiErrorMessage } from "@/services/api/api-error";
import {
  getClassroomMembers,
  type ApiPage,
  type ApiClassroomMember,
} from "@/services/api/classroom.service";
import type { Classroom, WorkspaceRole } from "../types/classroom-types";
import { PersonAvatar } from "../ui/classroom-ui";

export function ClassroomMembersView({
  classroom,
}: {
  classroom: Classroom;
  role: WorkspaceRole;
}) {
  const { user } = useAuthSession();
  return (
    <MemberDirectory
      key={user?.id + ":" + classroom.id}
      classroomId={classroom.id}
    />
  );
}

function MemberDirectory({ classroomId }: { classroomId: string }) {
  const [page, setPage] = useState<ApiPage<ApiClassroomMember>>({
    items: [],
    nextCursor: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const active = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const cursors = useRef(new Set<string>());

  useEffect(() => {
    const controller = new AbortController();
    active.current = controller;
    cursors.current.clear();
    getClassroomMembers(classroomId, undefined, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setPage(result);
        if (result.nextCursor) cursors.current.add(result.nextCursor);
        setError("");
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setPage({ items: [], nextCursor: null });
          setError(
            getApiErrorMessage(
              failure,
              "Classroom members could not be loaded.",
            ),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [classroomId, reload]);

  async function more() {
    const controller = active.current;
    if (
      loading ||
      pending.current ||
      !page.nextCursor ||
      !controller ||
      controller.signal.aborted
    )
      return;
    pending.current = true;
    setLoading(true);
    setError("");
    try {
      const result = await getClassroomMembers(
        classroomId,
        page.nextCursor,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (result.nextCursor && cursors.current.has(result.nextCursor))
        throw new Error(
          "Member pagination could not continue. Please reload the member list.",
        );
      if (result.nextCursor) cursors.current.add(result.nextCursor);
      setPage((current) => ({
        items: [
          ...new Map(
            [...current.items, ...result.items].map((member) => [
              member.id,
              member,
            ]),
          ).values(),
        ],
        nextCursor: result.nextCursor,
      }));
    } catch (failure) {
      if (!controller.signal.aborted) {
        if (
          axios.isAxiosError(failure) &&
          [401, 403, 404].includes(failure.response?.status ?? 0)
        )
          setPage({ items: [], nextCursor: null });
        setError(
          getApiErrorMessage(failure, "More members could not be loaded."),
        );
      }
    } finally {
      pending.current = false;
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <section aria-label="Classroom members" className="min-w-0 space-y-4">
      <p className="text-xs leading-5 text-muted-foreground">
        The class owner and currently enrolled students.
      </p>
      {error && (
        <div
          role="alert"
          className="space-y-2 rounded-lg bg-destructive/5 p-3 text-sm"
        >
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setReload((value) => value + 1);
            }}
          >
            Reload members
          </Button>
        </div>
      )}
      {loading && <ClassroomMembersSkeleton />}
      {!loading && !error && page.items.length === 0 && (
        <p className="text-sm text-muted-foreground">No members to display.</p>
      )}
      <ul className="divide-y divide-border">
        {page.items.map((member) => (
          <li
            key={member.id}
            className="flex min-w-0 items-center gap-3 py-3 first:pt-0"
          >
            <PersonAvatar name={member.name} />
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium [overflow-wrap:anywhere]">
                {member.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                {member.role === "owner" ? (
                  <GraduationCap aria-hidden="true" className="size-3" />
                ) : (
                  <Users aria-hidden="true" className="size-3" />
                )}
                {member.role === "owner" ? "Class owner" : "Student"}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {page.nextCursor && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => void more()}
        >
          Load more members
        </Button>
      )}
    </section>
  );
}
