import { useMemo, useState, type ReactNode } from 'react'
import { ClassworkReviewContext, type ClassworkReviewState, type ReviewSelection } from './classwork-review-context'

export function ClassworkReviewProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<ClassworkReviewState['panel']>('form')
  const [selected, select] = useState<ReviewSelection | null>(null)
  const value = useMemo(() => ({ panel, setPanel, selected, select }), [panel, selected])
  return <ClassworkReviewContext.Provider value={value}>{children}</ClassworkReviewContext.Provider>
}
