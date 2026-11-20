import { useId, useRef, useState, type FormEvent } from "react";
import { QuestionEditor } from "./classwork-question-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/services/api/api-error";
import type { Classwork } from "@/services/api/academic.service";
import {
  addClassworkQuestion,
  createClassroomWork,
  type QuestionInput,
} from "@/services/api/classwork-workspace.service";
import {
  localClassworkDate,
  readClassworkFields,
} from "../utils/classwork-deadline";
import { ClassworkDeadlinePicker } from "./classwork-deadline-picker";
import {
  gradingPeriodLabels,
  gradingPeriods,
} from "../contents/grading-periods";

export function ClassworkFields({
  work,
  disabled,
  schoolClassroom,
}: {
  work?: Classwork;
  disabled?: boolean;
  schoolClassroom?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="work-title">Title</Label>
        <Input
          id="work-title"
          name="title"
          required
          maxLength={200}
          defaultValue={work?.title}
          disabled={disabled}
          placeholder="e.g. Introduction to sensors"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="work-instructions">Instructions</Label>
        <Textarea
          id="work-instructions"
          name="instructions"
          required
          maxLength={10000}
          defaultValue={work?.instructions}
          disabled={disabled}
          placeholder="Explain what students need to complete."
          className="min-h-28"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="work-points">Maximum points</Label>
        <Input
          id="work-points"
          name="maxPoints"
          type="number"
          min={1}
          max={10000}
          step={1}
          defaultValue={work?.maxPoints ?? ""}
          disabled={disabled}
          placeholder="e.g. 10"
          aria-describedby="points-help"
        />
        <p id="points-help" className="text-xs leading-5 text-muted-foreground">
          Set the grading maximum before publishing. Leave blank for
          feedback-only work. Published grading settings cannot be changed.
        </p>
      </div>
      {schoolClassroom && (
        <div className="space-y-2">
          <Label htmlFor="work-period">Grading period</Label>
          <Select
            name="gradingPeriod"
            defaultValue={work?.gradingPeriod ?? "none"}
            disabled={disabled}
            items={[
              { value: "none", label: "No period" },
              ...gradingPeriods.map((value) => ({
                value,
                label: gradingPeriodLabels[value],
              })),
            ]}
          >
            <SelectTrigger id="work-period" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No period</SelectItem>
              {gradingPeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {gradingPeriodLabels[period]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="work-closing">Closing date and time</Label>
        <ClassworkDeadlinePicker
          initialValue={localClassworkDate(work?.dueAt ?? null)}
          disabled={disabled}
        />
        <p
          id="closing-help"
          className="text-xs leading-5 text-muted-foreground"
        >
          Your time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}.
          Submissions close for everyone at this time. Unsubmitted work is
          marked Missing.
        </p>
      </div>
    </div>
  );
}

export function ClassworkCreator({
  classroomId,
  schoolClassroom,
  onCreated,
  onCancel,
}: {
  classroomId: string;
  schoolClassroom?: boolean;
  onCreated: (id: string, notice?: string) => void;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("form");
  const formId = useId();
  const pending = useRef(false);
  const [editingFirst, setEditingFirst] = useState(true);
  const [firstQuestion, setFirstQuestion] = useState<QuestionInput | null>(
    null,
  );
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    try {
      const input = readClassworkFields(new FormData(event.currentTarget));
      if (kind === "form" && (!firstQuestion || editingFirst))
        throw new Error(
          "Save the first question before creating the draft.",
        );
      pending.current = true;
      setBusy(true);
      setError("");
      const draft = await createClassroomWork(classroomId, input);
      if (kind === "form" && firstQuestion) {
        try {
          await addClassworkQuestion(
            draft.id,
            draft.version ?? 0,
            firstQuestion,
          );
        } catch (cause) {
          onCreated(
            draft.id,
            "The draft was saved, but adding its first question could not be confirmed. Review the saved questions below before publishing. " +
              getApiErrorMessage(cause, "Try again."),
          );
          return;
        }
      }
      onCreated(draft.id);
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not create classwork."));
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-7"
      aria-labelledby="create-work-heading"
    >
      <header>
        <h3 id="create-work-heading" className="font-semibold">
          Create classwork
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Save a draft to add more questions, review, and publish.
        </p>
      </header>
      <div className="space-y-2">
        <Label htmlFor="classwork-kind">Classwork type</Label>
        <Select
          value={kind}
          disabled={busy}
          onValueChange={(value) => setKind(value ?? "form")}
        >
          <SelectTrigger id="classwork-kind" className="h-10 w-full">
            <SelectValue>
              {kind === "form"
                ? "Form — questions"
                : "Assessment — written response"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assessment">
              Assessment — written response
            </SelectItem>
            <SelectItem value="form">Form — questions</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <form id={formId} onSubmit={create}>
        <ClassworkFields disabled={busy} schoolClassroom={schoolClassroom} />
      </form>
      {kind === "form" && (
        <div className="space-y-3">
          {firstQuestion && !editingFirst ? (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">
                First question: {firstQuestion.prompt}
              </p>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setEditingFirst(true)}
              >
                Change first question
              </Button>
            </div>
          ) : (
            <QuestionEditor
              position={1}
              initial={firstQuestion ?? undefined}
              disabled={busy}
              onCancel={firstQuestion ? () => setEditingFirst(false) : undefined}
              onSave={async (input) => {
                setFirstQuestion(input);
                setEditingFirst(false);
                return true;
              }}
            />
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          form={formId}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
          disabled={busy}
        >
          {busy ? "Saving…" : "Create draft"}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
