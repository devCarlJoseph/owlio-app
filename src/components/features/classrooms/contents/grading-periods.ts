export const gradingPeriodLabels = {
  PRELIM: 'Prelim',
  MIDTERM: 'Midterm',
  SEMI_FINALS: 'Semi-finals',
  FINALS: 'Finals',
} as const

export const gradingPeriods = ['PRELIM', 'MIDTERM', 'SEMI_FINALS', 'FINALS'] as const
export type GradingPeriod = typeof gradingPeriods[number]
