import { useId, useState, type FormEvent } from "react";
import {
  Minus, CheckSquare, CircleChevronDown, CircleDot, CloudUpload,
  Ellipsis, Plus, Star, TextAlignStart, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { QuestionInput, QuestionDefinition } from "@/services/api/classwork-workspace.service";

const questionTypes = [
  { value: "short_answer", label: "Short answer", icon: Minus },
  { value: "paragraph", label: "Paragraph", icon: TextAlignStart },
  { value: "multiple_choice", label: "Multiple choice", icon: CircleDot },
  { value: "checkboxes", label: "Checkboxes", icon: CheckSquare },
  { value: "dropdown", label: "Dropdown", icon: CircleChevronDown },
  { value: "file_upload", label: "File upload", icon: CloudUpload },
  { value: "linear_scale", label: "Linear scale", icon: Ellipsis },
  { value: "rating", label: "Rating", icon: Star },
] as const;
const questionGroups = [questionTypes.slice(0, 2), questionTypes.slice(2, 5), questionTypes.slice(5, 6), questionTypes.slice(6)];
const emptyOptions = ["", "", "", ""];
type QuestionType = (typeof questionTypes)[number]["value"];

export function QuestionEditor({
  position, initial, disabled, onSave, onCancel,
}: {
  position: number;
  initial?: QuestionInput;
  disabled: boolean;
  onSave: (input: QuestionInput) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const id = useId();
  const definition = initial && "definition" in initial ? initial.definition : undefined;
  const initialChoice = definition?.type === "checkboxes" || definition?.type === "dropdown" ? definition
    : initial && "options" in initial ? initial : undefined;
  const [type, setType] = useState<QuestionType>(definition?.type ?? "multiple_choice");
  const [options, setOptions] = useState(initialChoice?.options ?? emptyOptions);
  const [correct, setCorrect] = useState(definition?.type === "dropdown" ? definition.answerIndex : initial && "answerIndex" in initial ? initial.answerIndex : 0);
  const [checked, setChecked] = useState<number[]>(definition?.type === "checkboxes" ? definition.answerIndexes : []);
  const [minimum, setMinimum] = useState(definition?.type === "linear_scale" ? definition.min : 1);
  const [maximum, setMaximum] = useState(definition?.type === "linear_scale" || definition?.type === "rating" ? definition.max : 5);
  const [error, setError] = useState("");
  const selectedType = questionTypes.find(item => item.value === type)!;
  const hasChoices = type === "multiple_choice" || type === "checkboxes" || type === "dropdown";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const prompt = String(new FormData(form).get("prompt") ?? "").trim();
    const values = options.map(value => value.trim());
    if (!prompt || (hasChoices && (values.some(value => !value) || new Set(values).size !== values.length))) {
      setError("Enter a question and give each choice a different, nonempty label.");
      return;
    }
    if (type === "checkboxes" && checked.length === 0) {
      setError("Mark at least one choice as correct.");
      return;
    }
    const fields = { position, prompt };
    let input: QuestionInput;
    if (type === "multiple_choice") {
      input = { ...fields, options: values, answerIndex: correct };
    } else {
      let definition: QuestionDefinition;
      switch (type) {
        case "dropdown": definition = { type, options: values, answerIndex: correct }; break;
        case "checkboxes": definition = { type, options: values, answerIndexes: checked }; break;
        case "linear_scale": definition = { type, min: minimum, max: maximum }; break;
        case "rating": definition = { type, max: maximum }; break;
        default: definition = { type };
      }
      input = { ...fields, definition };
    }
    setError("");
    if (await onSave(input)) {
      form.reset();
      setOptions(emptyOptions);
      setCorrect(0);
      setChecked([]);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-border border-l-4 border-l-brand bg-card p-4 shadow-xs">
      <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-prompt`}>Question</Label>
          <Textarea id={`${id}-prompt`} name="prompt" maxLength={1000} required disabled={disabled}
            defaultValue={initial?.prompt} placeholder="Enter a question" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-type`}>Question type</Label>
          <Select value={type} disabled={disabled} onValueChange={value => {
            if (!value) return;
            setType(value);
            if (value === "rating" && maximum < 3) setMaximum(3);
            setError("");
          }}>
            <SelectTrigger id={`${id}-type`} className="w-full">
              <SelectValue><selectedType.icon aria-hidden="true" className="mr-2 text-muted-foreground" />{selectedType.label}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="min-w-48 motion-reduce:animate-none">
              {questionGroups.map((group, index) => (
                <SelectGroup key={group[0].value} className="m-0 p-0">
                  {index > 0 && <SelectSeparator className="mx-0 my-2" />}
                  {group.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value} className="min-h-12 rounded-none pl-3.5 pr-8 data-highlighted:bg-muted data-selected:bg-brand-soft">
                      <Icon aria-hidden="true" className="mr-1.5 size-5 text-muted-foreground" />{label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {hasChoices && (
        <fieldset disabled={disabled} className="space-y-2">
          <legend className="mb-2 text-xs text-muted-foreground">
            {type === "checkboxes" ? "Mark all correct choices." : "Mark the correct choice."}
          </legend>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              {type === "checkboxes" ? (
                <Checkbox aria-label={`Mark choice ${index + 1} as correct`} disabled={disabled} checked={checked.includes(index)}
                  onCheckedChange={value => setChecked(current => value ? [...current, index] : current.filter(item => item !== index))} />
              ) : (
                <input type="radio" name={`${id}-correct`} aria-label={`Mark choice ${index + 1} as correct`}
                  checked={correct === index} onChange={() => setCorrect(index)} className="size-4 shrink-0 accent-brand" />
              )}
              <Input aria-label={`Choice ${index + 1}`} placeholder={`Choice ${index + 1}`} maxLength={200} required value={option}
                onChange={event => setOptions(current => current.map((value, i) => i === index ? event.target.value : value))} />
              <Button type="button" size="icon" variant="ghost" aria-label={`Remove choice ${index + 1}`}
                disabled={disabled || options.length <= 2}
                onClick={() => {
                  setOptions(current => current.filter((_, i) => i !== index));
                  setCorrect(current => current === index ? 0 : current > index ? current - 1 : current);
                  setChecked(current => current.filter(value => value !== index).map(value => value > index ? value - 1 : value));
                }}>
                <Trash2 />
              </Button>
            </div>
          ))}
          {options.length < 8 && (
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => setOptions(current => [...current, ""])}>
              <Plus />Add choice
            </Button>
          )}
        </fieldset>
      )}
      {(type === "linear_scale" || type === "rating") && (
        <div className="flex flex-wrap gap-4">
          {type === "linear_scale" && (
            <NumberPicker id={`${id}-min`} label="Starts at" values={[0, 1]} value={minimum} onChange={setMinimum} disabled={disabled} />
          )}
          <NumberPicker id={`${id}-max`} label={type === "rating" ? "Number of stars" : "Ends at"}
            values={type === "rating" ? [3, 4, 5, 6, 7, 8, 9, 10] : [2, 3, 4, 5, 6, 7, 8, 9, 10]}
            value={maximum} onChange={setMaximum} disabled={disabled} />
        </div>
      )}
      {type === "short_answer" && <p className="text-sm text-muted-foreground">One line, up to 300 characters.</p>}
      {type === "paragraph" && <p className="text-sm text-muted-foreground">A longer written response.</p>}
      {type === "file_upload" && <p className="text-sm text-muted-foreground">One PDF, PNG, or JPEG per question, up to 5 MB. A submission can include up to five files.</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="outline" className="border-brand/30 text-brand hover:bg-brand-soft hover:text-brand" disabled={disabled}>Save question</Button>
        {onCancel && <Button type="button" variant="ghost" disabled={disabled} onClick={onCancel}>Cancel question</Button>}
      </div>
    </form>
  );
}

function NumberPicker({ id, label, values, value, onChange, disabled }: {
  id: string; label: string; values: number[]; value: number; onChange: (value: number) => void; disabled: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={next => { if (next !== null) onChange(next); }} disabled={disabled}>
        <SelectTrigger id={id}><SelectValue>{value}</SelectValue></SelectTrigger>
        <SelectContent>{values.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
