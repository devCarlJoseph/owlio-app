import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getTheme, setTheme, subscribeTheme, type Theme } from '@/lib/theme'
import { getApiErrorMessage } from '@/services/api/api-error'
import { requestOperation } from '@/services/api/contract-client'
import type { OperationData } from '@/services/api/generated-contract'
import { AccountActions, AccountHeading, AccountPage, AccountRow } from './account-page'

type Preferences = OperationData<'GET /api/v1/users/me/settings'>
const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] satisfies { value: Theme; label: string }[]

export function SettingsView() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme)
  const [saved, setSaved] = useState<Preferences>()
  const [draft, setDraft] = useState<Preferences>()
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    void requestOperation('GET /api/v1/users/me/settings', { signal: controller.signal })
      .then(value => {
        if (controller.signal.aborted) return
        setSaved(value)
        setDraft(value)
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setLoadError(getApiErrorMessage(requestError, 'Could not load account settings.'))
      })
    return () => controller.abort()
  }, [attempt])

  const changes = saved && draft ? {
    ...(draft.timeZone.trim() !== saved.timeZone ? { timeZone: draft.timeZone.trim() } : {}),
    ...(draft.locale.trim() !== saved.locale ? { locale: draft.locale.trim() } : {}),
    ...(draft.sessionReminders !== saved.sessionReminders ? { sessionReminders: draft.sessionReminders } : {}),
  } : {}
  const hasChanges = Object.keys(changes).length > 0

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasChanges || saving || !draft?.timeZone.trim() || !draft.locale.trim()) return
    setSaving(true)
    setStatus('')
    setError('')
    try {
      const updated = await requestOperation('PATCH /api/v1/users/me/settings', { body: changes })
      setSaved(updated)
      setDraft(updated)
      setStatus('Preferences saved.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not save your preferences.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AccountPage>
      <AccountHeading title="Settings" description="Manage your display preferences and account settings." />
      <AccountRow label="Appearance" id="account-theme" description="Applies to this browser.">
        <Select items={themeOptions} value={theme} onValueChange={value => { if (value) setTheme(value) }}>
          <SelectTrigger id="account-theme" aria-describedby="account-theme-description" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{themeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>
      </AccountRow>
      <section aria-labelledby="preferences-heading" className="space-y-5 border-t pt-5">
        <h3 id="preferences-heading" className="text-base font-semibold">Account preferences</h3>
        {loadError ? (
          <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
            <p className="text-destructive">{loadError}</p>
            <Button variant="outline" onClick={() => { setLoadError(''); setAttempt(value => value + 1) }}>Try again</Button>
          </div>
        ) : draft ? (
          <form onSubmit={save} className="space-y-5">
            <AccountRow label="Time zone" id="account-time-zone" description="Enter an IANA time zone such as Asia/Manila.">
              <Input id="account-time-zone" aria-describedby="account-time-zone-description" value={draft.timeZone}
                onChange={event => setDraft({ ...draft, timeZone: event.target.value })} maxLength={80} required disabled={saving} />
            </AccountRow>
            <AccountRow label="Locale" id="account-locale" description="Enter a language tag such as en-US.">
              <Input id="account-locale" aria-describedby="account-locale-description" value={draft.locale}
                onChange={event => setDraft({ ...draft, locale: event.target.value })} maxLength={35} required disabled={saving} />
            </AccountRow>
            <AccountRow label="Session reminders" id="account-reminders" description="Opt in to reminders for scheduled sessions.">
              <Switch id="account-reminders" aria-describedby="account-reminders-description" checked={draft.sessionReminders}
                onCheckedChange={checked => setDraft({ ...draft, sessionReminders: checked })} disabled={saving} />
            </AccountRow>
            <AccountActions>
              <Button type="submit" disabled={saving || !hasChanges || !draft.timeZone.trim() || !draft.locale.trim()}>
                {saving ? 'Saving…' : 'Save preferences'}
              </Button>
              {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </AccountActions>
          </form>
        ) : <p role="status" className="text-sm text-muted-foreground">Loading account preferences…</p>}
      </section>
      <div className="border-t pt-5">
        <AccountRow label="Account security" description="Review your sign-in methods.">
          <Link className={buttonVariants({ variant: "outline" })} to="../account/security" relative="path">Open account security</Link>
        </AccountRow>
      </div>
    </AccountPage>
  )
}
