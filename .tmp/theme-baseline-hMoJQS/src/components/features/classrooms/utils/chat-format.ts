const dateOf = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function chatDurationLabel(seconds: number) {
  const whole = Math.floor(Math.max(0, seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

export function chatDay(value: string) {
  return dateOf(value)?.toDateString() ?? value
}

export function chatDateLabel(value: string) {
  const date = dateOf(value)
  return date ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date) : value
}

export function chatTimeLabel(value: string) {
  const date = dateOf(value)
  return date ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date) : value
}
