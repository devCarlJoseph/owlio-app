import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { classroomSections } from '../contents/classroom-sections'

export function ClassroomSectionNavigation({ tab, schoolClassroom }: { tab: string; schoolClassroom: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const revealTab = () => {
      // Desktop uses a vertical menu, so only scroll the mobile strip.
      if (viewport.scrollWidth <= viewport.clientWidth) return
      const selected = activeRef.current?.getBoundingClientRect()
      const bounds = viewport.getBoundingClientRect()
      if (!selected) return
      const delta = selected.left < bounds.left ? selected.left - bounds.left : selected.right > bounds.right ? selected.right - bounds.right : 0
      if (delta) viewport.scrollBy?.({ left: delta })
    }
    revealTab()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', revealTab)
      return () => window.removeEventListener('resize', revealTab)
    }
    const observer = new ResizeObserver(revealTab)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [tab])

  return (
    <nav aria-label="Classroom navigation" className="classroom-section-navigation">
      <div ref={viewportRef} className="classroom-navigation-viewport">
        <TabsList aria-label="Classroom sections" className="classroom-section-list">
          {classroomSections.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} ref={value === tab ? activeRef : undefined} value={value} className="classroom-section-trigger">
              <span className="classroom-section-icon"><Icon aria-hidden="true" className="size-3.5" /></span>
              <span>{value === 'progress' && !schoolClassroom ? 'Progress & Feedback' : label}</span>
              <ChevronRight aria-hidden="true" className="classroom-section-chevron ml-auto size-3" />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </nav>
  )
}
