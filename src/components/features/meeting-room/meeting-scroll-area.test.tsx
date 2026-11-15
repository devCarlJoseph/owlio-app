import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatPanel } from './coaching-meeting-parts'

afterEach(cleanup)

describe('meeting scroll areas', () => {
  it('exposes the real scroll viewport separately from the root', () => {
    const root = createRef<HTMLDivElement>()
    const viewport = createRef<HTMLDivElement>()
    render(<ScrollArea ref={root} viewportRef={viewport}><p>Scrollable content</p></ScrollArea>)
    expect(root.current).not.toBe(viewport.current)
    expect(root.current?.contains(viewport.current)).toBe(true)
    expect(viewport.current?.contains(screen.getByText('Scrollable content'))).toBe(true)
  })

  it('scrolls new messages in the shadcn viewport while keeping the composer outside it', () => {
    const send = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault())
    const props = { people: [], localIdentity: 'self', enabled: true, draft: 'A reply', sending: false, onDraft: vi.fn(), onSend: send, onClose: vi.fn() }
    const message = { id: 'm1', identity: 'self', text: 'First message', sentAt: 1 }
    const view = render(<ChatPanel {...props} messages={[message]} />)
    const viewport = screen.getByRole('log', { name: 'Meeting messages' }).querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement
    Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 800 })
    view.rerender(<ChatPanel {...props} messages={[message, { ...message, id: 'm2', text: 'Second message' }]} />)
    expect(viewport.scrollTop).toBe(800)
    expect(viewport.contains(screen.getByLabelText('Write a meeting message'))).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(send).toHaveBeenCalledOnce()
  })
})
