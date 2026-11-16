import { DateTimePicker } from '@/components/ui/date-time-picker'

export function ClassworkDeadlinePicker({ initialValue = '', disabled = false }: { initialValue?: string; disabled?: boolean }) {
  return <DateTimePicker name="dueAt" label="Closing" placeholder="Choose a closing date" id="work-closing" describedBy="closing-help" initialValue={initialValue} defaultTime="23:59" disabled={disabled} />
}
