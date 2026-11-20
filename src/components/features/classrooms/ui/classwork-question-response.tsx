import { useState } from "react";
import { Check, Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApiErrorMessage } from "@/services/api/api-error";
import { openDownload, type Submission } from "@/services/api/academic.service";
import {
  getSubmissionFileDownload,
  type ClassworkQuestion,
  type QuestionAnswer,
} from "@/services/api/classwork-workspace.service";

export function FormQuestionResponse({
  question, answer, submission, owned, locked, onAnswer, onUpload, availableFiles, uploadBlocked, retryUpload,
}: {
  question: ClassworkQuestion;
  answer?: QuestionAnswer;
  submission: Submission | null;
  owned: boolean;
  locked: boolean;
  onAnswer: (answer: QuestionAnswer | null) => void;
  onUpload: (file: File) => void;
  availableFiles: Submission["files"];
  uploadBlocked: boolean;
  retryUpload?: () => void;
}) {
  const definition = question.definition;
  if (!definition) return null;
  const questionId = question.id;
  const label = `Answer: ${question.prompt}`;
  switch (definition.type) {
    case "short_answer":
    case "paragraph": {
      const { type } = definition;
      const props = {
        "aria-label": label,
        value: answer?.type === "short_answer" || answer?.type === "paragraph" ? answer.text : "",
        readOnly: locked,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onAnswer({ questionId, type, text: event.currentTarget.value }),
        placeholder: type === "short_answer" ? "Short answer" : "Paragraph response",
      };
      return type === "short_answer" ? <Input {...props} maxLength={300} /> : <Textarea {...props} maxLength={4000} rows={4} />;
    }
    case "checkboxes": {
      const indexes = answer?.type === "checkboxes" ? answer.optionIndexes : [];
      return <div className="space-y-2">{definition.options.map((option, index) => (
        <label key={index} className="flex min-h-9 items-center gap-3 break-words text-sm">
          <Checkbox disabled={locked} checked={indexes.includes(index)} onCheckedChange={checked => {
            const optionIndexes = checked ? [...indexes, index] : indexes.filter(item => item !== index);
            onAnswer(optionIndexes.length ? { questionId, type: "checkboxes", optionIndexes } : null);
          }} />
          <span>{option}</span>
          {owned && definition.answerIndexes?.includes(index) && <Check aria-label="Correct answer" className="size-4 text-brand" />}
        </label>
      ))}</div>;
    }
    case "dropdown": {
      const items = definition.options.map((option, index) => ({ value: index, label: option }));
      const selected = answer?.type === "dropdown" ? answer.optionIndex : null;
      return (
        <div className="space-y-2">
          <Select items={items} value={selected} disabled={locked} onValueChange={value => {
            if (value !== null) onAnswer({ questionId, type: "dropdown", optionIndex: value });
          }}>
            <SelectTrigger aria-label={label} className="w-full sm:max-w-80"><SelectValue placeholder="Choose an answer" /></SelectTrigger>
            <SelectContent>{items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
          {owned && definition.answerIndex !== undefined && (
            <p className="text-xs text-muted-foreground">Correct answer: {definition.options[definition.answerIndex]}</p>
          )}
        </div>
      );
    }
    case "linear_scale":
    case "rating": {
      const { type, max } = definition;
      const min = type === "rating" ? 1 : definition.min;
      const selected = answer?.type === "linear_scale" || answer?.type === "rating" ? answer.value : undefined;
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: max - min + 1 }, (_, index) => {
            const value = min + index;
            return (
              <label key={value} className="relative flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-md border border-border px-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input className="sr-only" type="radio" name={`answer-${questionId}`} checked={selected === value}
                  aria-label={type === "rating" ? `${value} of ${max} stars` : String(value)}
                  disabled={locked} onChange={() => onAnswer({ questionId, type, value })} />
                {type === "rating" && <Star aria-hidden="true" className={`size-4 text-brand ${selected !== undefined && value <= selected ? "fill-current" : ""}`} />}
                {value}
              </label>
            );
          })}
        </div>
      );
    }
    case "file_upload": {
      const file = answer?.type === "file_upload" ? submission?.files.find(item => item.id === answer.fileId) : undefined;
      return (
        <div className="space-y-2">
          {file && submission && <SubmissionFileLink submissionId={submission.id} file={file} />}
          {!owned && !file && !retryUpload && (
            <Input aria-label={label} type="file" accept=".pdf,.png,.jpg,.jpeg" disabled={locked || uploadBlocked}
              onChange={event => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) onUpload(file);
              }} />
          )}
          {retryUpload && <Button type="button" variant="outline" size="sm" disabled={locked} onClick={retryUpload}>Retry upload</Button>}
          {!owned && !locked && !uploadBlocked && !file && availableFiles.map(item => (
            <Button key={item.id} type="button" variant="outline" size="sm"
              onClick={() => onAnswer({ questionId, type: "file_upload", fileId: item.id })}>
              Attach {item.fileName}
            </Button>
          ))}
          <p className="text-xs text-muted-foreground">PDF, PNG, or JPEG · Up to 5 MB</p>
        </div>
      );
    }
  }
}

export function SubmissionFileLink({ submissionId, file }: { submissionId: string; file: Submission["files"][number] }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function download() {
    setPending(true);
    setError("");
    try {
      await openDownload(() => getSubmissionFileDownload(submissionId, file.id));
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not download the file."));
    } finally {
      setPending(false);
    }
  }
  return <div>
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => void download()} className="h-auto min-h-8 max-w-full whitespace-normal text-left">
      <Download /><span className="min-w-0 break-all">{file.fileName}</span>
    </Button>
    {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
  </div>;
}
