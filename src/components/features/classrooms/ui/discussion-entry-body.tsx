import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { DiscussionComposer } from '../forms/discussion-composer'
import { DiscussionText } from './discussion-text'

export function DiscussionEntryBody({ entry, kind, disabled, onSave }: {
  entry: { id: string; body: string; authorName: string; editedAt?: string | null }
  kind: 'post' | 'comment'
  disabled: boolean
  onSave?: (body: string, expectedEditedAt: string | null) => Promise<boolean>
}) {
  const [original, setOriginal] = useState<{ body: string; editedAt: string | null } | null>(null)
  const [error, setError] = useState('')
  const trigger = useRef<HTMLButtonElement>(null)
  const label = kind === 'post' ? 'Edit discussion post' : 'Edit comment'
  const canEdit = Boolean(onSave) && entry.editedAt !== undefined && !original

  function closeEditor() {
    setOriginal(null)
    setError('')
    requestAnimationFrame(() => trigger.current?.focus())
  }

  return <div className="min-w-0 space-y-1">
    {original ? <DiscussionComposer
      id={`edit-${kind}-${entry.id}`}
      label={label}
      authorName={entry.authorName}
      maxLength={kind === 'post' ? 4000 : 1000}
      disabled={disabled}
      submitLabel="Save changes"
      edit={{ initialBody: original.body, onCancel: closeEditor }}
      onSubmit={async body => {
        if (!onSave) return false
        setError('')
        try {
          if (await onSave(body, original.editedAt)) closeEditor()
        } catch (cause) {
          setError(getApiErrorMessage(cause, 'Changes could not be saved. Please try again.'))
        }
        return false
      }}
    /> : <DiscussionText text={entry.body} className="text-sm leading-6 text-foreground/80 [overflow-wrap:anywhere]" />}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {(entry.editedAt || canEdit) && <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
      {entry.editedAt && <time dateTime={entry.editedAt}>Edited {new Date(entry.editedAt).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      })}</time>}
      {canEdit && <Button ref={trigger} type="button" variant="ghost" size="sm"
        className="h-auto px-1.5 py-0.5 text-xs" disabled={disabled} onClick={() => setOriginal({ body: entry.body, editedAt: entry.editedAt ?? null })}>
        {label}
      </Button>}
    </div>}
  </div>
}
