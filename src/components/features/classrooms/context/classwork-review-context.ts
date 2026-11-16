import { createContext, useContext } from 'react'

export type ReviewSelection = { id: string; studentId: string; name: string }
export type ClassworkReviewState = {
  panel: 'form' | 'student-work'
  setPanel: (panel: 'form' | 'student-work') => void
  selected: ReviewSelection | null
  select: (submission: ReviewSelection | null) => void
}
export const ClassworkReviewContext = createContext<ClassworkReviewState | null>(null)
export function useClassworkReview() {
  const context = useContext(ClassworkReviewContext)
  if (!context) throw new Error('Classwork review requires its activity provider.')
  return context
}
