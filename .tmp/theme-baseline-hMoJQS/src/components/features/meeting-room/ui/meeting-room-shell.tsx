import type { ReactNode } from 'react'

// Preserve a bounded flex chain from the immersive dashboard to the call panels.
// Lobby content keeps its normal page scrolling before a room is connected.
export function MeetingRoomShell({ connected, children }: { connected: boolean; children: ReactNode }) {
  return <div className={connected ? 'flex h-full min-h-0 min-w-0 w-full flex-1 flex-col gap-2 overflow-hidden' : 'space-y-4'}>{children}</div>
}
