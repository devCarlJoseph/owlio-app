import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
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

export function QuestionEditor({
  position,
  disabled,
  onSave,
}: {
  position: number;
  disabled: boolean;
  onSave: (input: QuestionInput) => Promise<boolean>;
}) {
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const prompt = String(new FormData(form).get("prompt") ?? "").trim();
    const values = options.map((value) => value.trim());
    if (
      !prompt ||
      values.some((value) => !value) ||
      new Set(values).size !== values.length
    ) {
      setError("Add a question and distinct, nonempty answer choices.");
      return;
    }
    setError("");
    if (
      await onSave({ position, prompt, options: values, answerIndex: correct })
    ) {
      form.reset();
      setOptions(["", "", "", ""]);
      setCorrect(0);
    }
  }
  return (
    <form
      onSubmit={save}
      className="space-y-4 rounded-xl border border-dashed border-border p-4"
    >
      <h4 className="text-sm font-semibold">Add a multiple-choice question</h4>
      <div className="space-y-2">
        <Label htmlFor="question-prompt">Question</Label>
        <Textarea
          id="question-prompt"
          name="prompt"
          maxLength={1000}
          required
          disabled={disabled}
        />
      </div>
      <fieldset disabled={disabled} className="space-y-3">
        <legend className="mb-2 text-xs text-muted-foreground">
          Select the correct answer. Students will not see the answer key.
        </legend>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              aria-label={`Mark choice ${index + 1} as correct`}
              checked={correct === index}
              onChange={() => setCorrect(index)}
              className="size-4 accent-brand"
            />
            <Input
              aria-label={`Choice ${index + 1}`}
              maxLength={200}
              required
              value={option}
              onChange={(event) =>
                setOptions((current) =>
                  current.map((value, i) =>
                    i === index ? event.target.value : value,
                  ),
                )
              }
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Remove choice ${index + 1}`}
              disabled={options.length <= 2}
              onClick={() => {
                setOptions((current) => current.filter((_, i) => i !== index));
                setCorrect(0);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {options.length < 8 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOptions((current) => [...current, ""])}
          >
            <Plus />
            Add choice
          </Button>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="outline"
        className="border-brand/30 text-brand hover:bg-brand-soft hover:text-brand"
        disabled={disabled}
      >
        Save question
      </Button>
    </form>
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
  // Questions define a quiz; written assessments use the API's text response.
  const [kind, setKind] = useState("assessment");
  const [firstQuestion, setFirstQuestion] = useState<QuestionInput | null>(
    null,
  );
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    try {
      const input = readClassworkFields(new FormData(event.currentTarget));
      if (kind === "quiz" && !firstQuestion)
        throw new Error(
          "Save the first quiz question before creating the draft.",
        );
      setBusy(true);
      setError("");
      const draft = await createClassroomWork(classroomId, input);
      if (kind === "quiz" && firstQuestion) {
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
          Save a draft, review it, then publish to this class.
        </p>
      </header>
      <div className="space-y-2">
        <Label htmlFor="classwork-kind">Classwork type</Label>
        <Select
          value={kind}
          disabled={busy}
          onValueChange={(value) => setKind(value ?? "assessment")}
        >
          <SelectTrigger id="classwork-kind" className="h-10 w-full">
            <SelectValue>
              {kind === "quiz"
                ? "Quiz — multiple choice"
                : "Assessment — written response"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assessment">
              Assessment — written response
            </SelectItem>
            <SelectItem value="quiz">Quiz — multiple choice</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {kind === "quiz" && (
        <div className="space-y-3">
          {firstQuestion ? (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">
                First question: {firstQuestion.prompt}
              </p>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setFirstQuestion(null)}
              >
                Change first question
              </Button>
            </div>
          ) : (
            <QuestionEditor
              position={1}
              disabled={busy}
              onSave={async (input) => {
                setFirstQuestion(input);
                return true;
              }}
            />
          )}
        </div>
      )}
      <form onSubmit={create} className="space-y-5">
        <ClassworkFields disabled={busy} schoolClassroom={schoolClassroom} />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={busy}
          >
            {busy ? "Saving…" : "Create draft"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
