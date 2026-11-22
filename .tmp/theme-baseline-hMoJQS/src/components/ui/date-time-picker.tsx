import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pad = (value: number) => String(value).padStart(2, "0");
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dayLabel = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date);

export function DateTimePicker({
  name,
  label,
  id,
  describedBy,
  placeholder = "Choose a date",
  initialValue = "",
  defaultTime = "09:00",
  disabled = false,
  dateOnly = false,
  minToday = false,
}: {
  name: string;
  label: string;
  id?: string;
  describedBy?: string;
  placeholder?: string;
  initialValue?: string;
  defaultTime?: string;
  disabled?: boolean;
  dateOnly?: boolean;
  minToday?: boolean;
}) {
  const parsed = initialValue ? new Date(initialValue) : null;
  const initial = parsed && Number.isFinite(parsed.getTime()) ? parsed : null;
  const defaultHour = Number(defaultTime.split(":")[0]);
  const defaultMinute = defaultTime.split(":")[1];
  const today = new Date();
  const startingDay =
    initial && Number.isFinite(initial.getTime()) ? initial : today;
  const [selected, setSelected] = useState<Date | null>(
    initial && Number.isFinite(initial.getTime()) ? initial : null,
  );
  const [month, setMonth] = useState(
    () => new Date(startingDay.getFullYear(), startingDay.getMonth(), 1),
  );
  const [hour, setHour] = useState(
    initial ? pad(initial.getHours() % 12 || 12) : pad(defaultHour % 12 || 12),
  );
  const [minute, setMinute] = useState(
    initial ? pad(initial.getMinutes()) : defaultMinute,
  );
  const [period, setPeriod] = useState(
    (initial ? initial.getHours() : defaultHour) < 12 ? "AM" : "PM",
  );
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(dateKey(startingDay));
  const days = useRef(new Map<string, HTMLButtonElement>());
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const validTime =
    /^\d{1,2}$/.test(hour) &&
    Number(hour) >= 1 &&
    Number(hour) <= 12 &&
    /^\d{1,2}$/.test(minute) &&
    Number(minute) <= 59;
  const hours24 = (Number(hour) % 12) + (period === "PM" ? 12 : 0);
  const value =
    selected && validTime
      ? `${dateKey(selected)}T${pad(hours24)}:${pad(Number(minute))}`
      : "";
  const first = new Date(
    month.getFullYear(),
    month.getMonth(),
    1 - month.getDay(),
  );
  const dates = Array.from(
    { length: 42 },
    (_, index) =>
      new Date(first.getFullYear(), first.getMonth(), first.getDate() + index),
  );
  const focusedVisible = dates.some((date) => dateKey(date) === focused);

  useEffect(() => {
    if (open) days.current.get(focused)?.focus();
  }, [focused, open]);

  function moveDay(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    const next = new Date(date);
    switch (event.key) {
      case "ArrowLeft":
        next.setDate(next.getDate() - 1);
        break;
      case "ArrowRight":
        next.setDate(next.getDate() + 1);
        break;
      case "ArrowUp":
        next.setDate(next.getDate() - 7);
        break;
      case "ArrowDown":
        next.setDate(next.getDate() + 7);
        break;
      case "Home":
        next.setDate(next.getDate() - next.getDay());
        break;
      case "End":
        next.setDate(next.getDate() + 6 - next.getDay());
        break;
      case "PageUp":
        next.setDate(1);
        next.setMonth(next.getMonth() - 1);
        break;
      case "PageDown":
        next.setDate(1);
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (minToday && dateKey(next) < dateKey(today)) return;
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    setFocused(dateKey(next));
  }

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value} disabled={disabled} />
      <Button
        ref={trigger}
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={describedBy}
        onClick={() => setOpen((current) => !current)}
        className="h-auto min-h-12 w-full justify-start gap-3 rounded-xl border-border bg-card px-4 py-3 text-left hover:border-brand/50 hover:bg-brand-soft/40"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
          <CalendarDays aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 whitespace-normal">
          <span className="block text-sm font-medium">
            {selected
              ? new Intl.DateTimeFormat(undefined, {
                  dateStyle: "long",
                }).format(selected)
              : placeholder}
          </span>
          {!dateOnly && <span className="mt-0.5 block text-xs text-muted-foreground">
            {selected && validTime
              ? `${pad(Number(hour))}:${pad(Number(minute))} ${period}`
              : "Select a date and set the time"}
          </span>}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </Button>
      {open && (
        <section
          id={panelId}
          aria-label={dateOnly ? label : `${label} date and time picker`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
          className="overflow-hidden rounded-2xl border border-brand/20 bg-card shadow-sm"
        >
          <div className="p-4 sm:p-5">
            <header className="mb-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Previous month"
                disabled={disabled || (minToday && month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth())}
                onClick={() =>
                  setMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() - 1,
                        1,
                      ),
                  )
                }
              >
                <ChevronLeft />
              </Button>
              <h4 aria-live="polite" className="text-sm font-semibold">
                {new Intl.DateTimeFormat(undefined, {
                  month: "long",
                  year: "numeric",
                }).format(month)}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Next month"
                disabled={disabled}
                onClick={() =>
                  setMonth(
                    (current) =>
                      new Date(
                        current.getFullYear(),
                        current.getMonth() + 1,
                        1,
                      ),
                  )
                }
              >
                <ChevronRight />
              </Button>
            </header>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span
                  key={day}
                  className="pb-2 text-[10px] font-medium text-muted-foreground"
                >
                  {day}
                </span>
              ))}
              {dates.map((date) => {
                const key = dateKey(date);
                const active = selected && key === dateKey(selected);
                return (
                  <Button
                    key={key}
                    ref={(element) => {
                      if (element) days.current.set(key, element);
                      else days.current.delete(key);
                    }}
                    type="button"
                    variant="ghost"
                    disabled={disabled || (minToday && key < dateKey(today))}
                    aria-label={dayLabel(date)}
                    aria-pressed={Boolean(active)}
                    aria-current={key === dateKey(today) ? "date" : undefined}
                    tabIndex={
                      key === focused ||
                      (!focusedVisible &&
                        date.getDate() === 1 &&
                        date.getMonth() === month.getMonth())
                        ? 0
                        : -1
                    }
                    onKeyDown={(event) => moveDay(event, date)}
                    onClick={() => {
                      setSelected(date);
                      setFocused(key);
                    }}
                    className={`h-9 w-full min-w-0 rounded-lg p-0 text-xs ${active ? "bg-brand text-brand-foreground hover:bg-brand/90 hover:text-brand-foreground" : date.getMonth() !== month.getMonth() ? "text-muted-foreground/50" : "hover:bg-brand-soft hover:text-brand"} ${!active && key === dateKey(today) ? "border border-brand/40 font-semibold text-brand" : ""}`}
                  >
                    {date.getDate()}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3 border-t border-border bg-muted/30 p-4 sm:p-5">
            {!dateOnly && <>
            <p className="flex items-center gap-2 text-xs font-semibold">
              <Clock3 aria-hidden="true" className="size-4 text-brand" />
              {label} time
            </p>
            <div className="flex flex-wrap items-end gap-2">
              <label className="w-16 space-y-1">
                <span className="text-[10px] text-muted-foreground">Hour</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  aria-label={`${label} hour`}
                  aria-invalid={
                    !/^\d{1,2}$/.test(hour) ||
                    Number(hour) < 1 ||
                    Number(hour) > 12
                  }
                  value={hour}
                  maxLength={2}
                  disabled={disabled}
                  onChange={(event) =>
                    setHour(event.target.value.replace(/\D/g, ""))
                  }
                  onBlur={() =>
                    setHour((current) =>
                      current ? current.padStart(2, "0") : "",
                    )
                  }
                  className="h-11 rounded-lg bg-card text-center text-lg font-semibold tabular-nums"
                />
              </label>
              <span aria-hidden="true" className="pb-3 text-muted-foreground">
                :
              </span>
              <label className="w-16 space-y-1">
                <span className="text-[10px] text-muted-foreground">
                  Minute
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  aria-label={`${label} minute`}
                  aria-invalid={
                    !/^\d{1,2}$/.test(minute) || Number(minute) > 59
                  }
                  value={minute}
                  maxLength={2}
                  disabled={disabled}
                  onChange={(event) =>
                    setMinute(event.target.value.replace(/\D/g, ""))
                  }
                  onBlur={() =>
                    setMinute((current) =>
                      current ? current.padStart(2, "0") : "",
                    )
                  }
                  className="h-11 rounded-lg bg-card text-center text-lg font-semibold tabular-nums"
                />
              </label>
              <div
                role="group"
                aria-label={`${label} time period`}
                className="flex h-11 gap-1 rounded-lg border border-border bg-card p-1"
              >
                {["AM", "PM"].map((item) => (
                  <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    aria-pressed={period === item}
                    onClick={() => setPeriod(item)}
                    className={`h-full px-2 text-xs ${period === item ? "bg-brand text-brand-foreground hover:bg-brand/90 hover:text-brand-foreground" : "text-muted-foreground"}`}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
            {!validTime && (
              <p role="alert" className="text-xs text-destructive">
                Use an hour from 1 to 12 and minutes from 00 to 59.
              </p>
            )}
            </>}
            <footer className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={() => {
                  setSelected(null);
                  setHour(pad(defaultHour % 12 || 12));
                  setMinute(defaultMinute);
                  setPeriod(defaultHour < 12 ? "AM" : "PM");
                }}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={disabled || !selected || !validTime}
                onClick={close}
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Done
              </Button>
            </footer>
          </div>
        </section>
      )}
    </div>
  );
}
