import { ClassroomClassworkSkeleton } from "../ui/classroom-skeletons";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpenCheck, Clock3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/services/api/api-error";
import {
  listClassroomWork,
  type ClassworkEntry,
} from "@/services/api/classwork-workspace.service";
import type { Classroom, WorkspaceRole } from "../types/classroom-types";
import { ClassworkCreator } from "../forms/classwork-editor";
import { useClassworkClock } from "../hooks/use-classwork-clock";
import {
  classworkClosed,
  classworkStatus,
  formatClassworkDate,
} from "../utils/classwork-deadline";
import { ClassworkDetail } from "./classwork-detail";
import { ClassworkReviewProvider } from "../context/classwork-review-provider";
import { ClassworkProgressPanel } from "../ui/classwork-progress-panel";
import {
  gradingPeriodLabels,
  gradingPeriods,
} from "../contents/grading-periods";

export function ClassroomClassworkView({
  classroom,
  initialId,
}: {
  classroom: Classroom;
  role?: WorkspaceRole;
  initialId?: string;
}) {
  const owned = classroom.access === "owner";
  const schoolClassroom = classroom.ownerWorkspace === "educators";
  const [items, setItems] = useState<ClassworkEntry[] | null>(null);
  const [selected, setSelected] = useState(initialId ?? "");
  const [creating, setCreating] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const now = useClassworkClock();
  const [active, setActive] = useState<ClassworkEntry | null>(null);
  const onEntryChange = useCallback(
    (entry: ClassworkEntry) => setActive(entry),
    [],
  );
  const visibleItems =
    periodFilter === "all"
      ? items
      : items?.filter(({ work }) => work.gradingPeriod === periodFilter);
  useEffect(() => {
    const controller = new AbortController();
    listClassroomWork(classroom.id, owned, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) {
          setItems(value);
          setError("");
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(getApiErrorMessage(cause, "Could not load classwork."));
      });
    return () => controller.abort();
  }, [classroom.id, owned, revision]);
  let content;
  if (selected)
    content = (
      <ClassworkDetail
        key={selected}
        classroomId={classroom.id}
        id={selected}
        owned={owned}
        schoolClassroom={schoolClassroom}
        schoolOwnerId={schoolClassroom && owned ? classroom.ownerId : undefined}
        notice={notice}
        onEntryChange={onEntryChange}
        onBack={() => {
          setSelected("");
          setItems(null);
          setNotice("");
          setRevision((value) => value + 1);
        }}
      />
    );
  else if (creating && owned)
    content = (
      <ClassworkCreator
        classroomId={classroom.id}
        schoolClassroom={schoolClassroom}
        onCancel={() => setCreating(false)}
        onCreated={(id, message) => {
          setCreating(false);
          setNotice(message ?? "Draft saved. Review it before publishing.");
          setSelected(id);
        }}
      />
    );
  else
    content = (
      <section
        aria-labelledby="classwork-heading"
        className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-7">
          <div>
            <h3 id="classwork-heading" className="text-sm font-semibold">
              Classwork
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {owned
                ? "Prepare quizzes and assessments for your class."
                : "Your educator’s quizzes and assessments, all in one place."}
            </p>
          </div>
          {owned && (
            <Button
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => setCreating(true)}
            >
              <Plus />
              Create classwork
            </Button>
          )}
        </header>
        {schoolClassroom && !!items?.length && (
          <div className="border-b border-border px-5 py-3 sm:px-7">
            <Select
              value={periodFilter}
              onValueChange={(value) => setPeriodFilter(value ?? "all")}
              items={[
                { value: "all", label: "All grading periods" },
                ...gradingPeriods.map((value) => ({
                  value,
                  label: gradingPeriodLabels[value],
                })),
              ]}
            >
              <SelectTrigger
                size="sm"
                aria-label="Filter classwork by grading period"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grading periods</SelectItem>
                {gradingPeriods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {gradingPeriodLabels[period]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {error ? (
          <div role="alert" className="space-y-3 p-6 text-sm">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError("");
                setItems(null);
                setRevision((value) => value + 1);
              }}
            >
              Retry classwork
            </Button>
          </div>
        ) : !items ? (
          <ClassroomClassworkSkeleton />
        ) : !items.length ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 px-5 py-12 text-center">
            <BookOpenCheck
              aria-hidden="true"
              className="size-8 text-muted-foreground"
            />
            <h4 className="text-sm font-medium">No classwork yet</h4>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              {owned
                ? "Create a quiz or written assessment, set its closing time, and publish it to your students."
                : "Published classwork will appear here when your educator assigns it."}
            </p>
          </div>
        ) : !visibleItems?.length ? (
          <p className="p-6 text-sm text-muted-foreground">
            No classwork in this grading period.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visibleItems.map(({ work, questions, submission }) => {
              const quiz = questions.questions.length > 0;
              const state = owned
                ? work.status === "DRAFT"
                  ? "Draft"
                  : classworkClosed(work.dueAt, now)
                    ? "Closed"
                    : "Published"
                : classworkStatus(work, submission, now);
              return (
                <li key={work.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(work.id)}
                    className="flex w-full min-w-0 items-center gap-4 px-5 py-5 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-7"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                      <BookOpenCheck aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-2">
                      <span className="block break-words text-sm font-semibold">
                        {work.title}
                      </span>
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {quiz ? "Quiz" : "Assessment"}
                        </Badge>
                        {work.gradingPeriod && (
                          <Badge variant="outline">
                            {gradingPeriodLabels[work.gradingPeriod]}
                          </Badge>
                        )}
                        <span
                          className={
                            state === "Missing"
                              ? "text-xs text-destructive"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          {state}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock3
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                        {work.dueAt
                          ? `Closes ${formatClassworkDate(work.dueAt)}`
                          : "No deadline"}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  const activeEntry = active?.work.id === selected ? active : null;
  const progressItems = activeEntry
    ? [
        ...(items ?? []).filter((item) => item.work.id !== activeEntry.work.id),
        activeEntry,
      ]
    : (items ?? []);
  return (
    <ClassworkReviewProvider key={selected || "collection"}>
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">{content}</div>
        <ClassworkProgressPanel
          items={progressItems}
          active={activeEntry}
          owned={owned}
          loading={items === null && !error}
          error={Boolean(error)}
          now={now}
          onSelect={(id) => {
            setCreating(false);
            setNotice("");
            setSelected(id);
          }}
        />
      </div>
    </ClassworkReviewProvider>
  );
}
