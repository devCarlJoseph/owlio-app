import { addDays, startOfDay } from 'date-fns'
import type { ScheduledSession } from '@/services/api/meeting.service'

// End times are exclusive: an event ending at midnight does not occupy the next day.
export function eventsOnDay(items: ScheduledSession[], day: Date) {
  const from = startOfDay(day).getTime()
  const to = addDays(startOfDay(day), 1).getTime()
  return items.filter(item => new Date(item.startsAt).getTime() < to && new Date(item.endsAt).getTime() > from)
}
