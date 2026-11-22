import { useEffect, useState } from 'react'
import { getNotifications } from '@/services/api/personal-workspace.service'

export function ClassroomMentionBadge() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    async function load() {
      try {
        const notifications = await getNotifications(controller.signal)
        if (!controller.signal.aborted) setCount(notifications.filter(item => item.kind === 'CLASSROOM_MENTION' && item.classroomMention && !item.readAt).length)
      } catch { if (!controller.signal.aborted) setCount(0) }
      finally { if (!controller.signal.aborted) timer = setTimeout(() => void load(), 10000) }
    }
    void load()
    return () => { controller.abort(); if (timer) clearTimeout(timer) }
  }, [])
  return count > 0 ? <span aria-label={`${count} unread classroom mentions`} className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-5 text-brand-foreground">{count > 99 ? '99+' : count}</span> : null
}
