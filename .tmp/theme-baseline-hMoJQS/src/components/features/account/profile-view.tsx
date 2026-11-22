import { ImagePlus, Trash2 } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useOutletContext } from 'react-router'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { AuthUser } from '@/services/api/api.types'
import { requestOperation } from '@/services/api/contract-client'
import { avatarLimit, avatarTypes, removeProfilePhoto, updateProfilePhoto, type ProfilePhoto } from '@/services/api/profile-photo.service'
import { AccountActions, AccountPage, AccountRow } from './account-page'
import type { ProfilePhotoContext } from './use-profile-photo'

export function ProfileView() {
  const { user } = useAuthSession()
  return user && <AccountPage><ProfileForm key={user.id} user={user} /></AccountPage>
}

function ProfileForm({ user }: { user: AuthUser }) {
  const { refreshCurrentUser } = useAuthSession()
  const [name, setName] = useState(user.name)
  const [savedName, setSavedName] = useState(user.name)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const { current, reload, update } = useOutletContext<ProfilePhotoContext>()
  const fileInput = useRef<HTMLInputElement>(null)
  const [changingPhoto, setChangingPhoto] = useState(false)
  const [photoStatus, setPhotoStatus] = useState('')
  const [photoError, setPhotoError] = useState('')
  const photo = current?.photo
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const displayName = name.trim()
    if (!displayName || displayName === savedName || saving) return
    setSaving(true)
    setError('')
    setStatus('')
    try {
      const updated = await requestOperation('PATCH /api/v1/users/me', { body: { name: displayName } })
      setName(updated.name)
      setSavedName(updated.name)
      setStatus('Display name saved.')
      await refreshCurrentUser(true)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not save your display name.'))
    } finally {
      setSaving(false)
    }
  }

  async function changePhoto(mutate: () => Promise<ProfilePhoto>, message: string) {
    setChangingPhoto(true)
    setPhotoError('')
    setPhotoStatus('')
    try {
      update(await mutate())
      setPhotoStatus(message)
    } catch (requestError) {
      setPhotoError(getApiErrorMessage(requestError, 'Could not update your profile photo.'))
    } finally {
      setChangingPhoto(false)
    }
  }

  function upload(file: File | undefined) {
    if (!file) return
    if (!avatarTypes.includes(file.type) || !file.size || file.size > avatarLimit) {
      setPhotoStatus('')
      setPhotoError('Choose a JPEG, PNG, or WebP image up to 2 MB.')
      return
    }
    void changePhoto(() => updateProfilePhoto(file), 'Profile photo updated.')
  }

  return (
    <>
      <header className="flex flex-wrap items-center gap-4 rounded-xl bg-muted/70 p-4 sm:p-5">
        <Avatar className="size-20 rounded-xl after:rounded-xl">
          {photo?.url && <AvatarImage key={current?.revision} src={photo.url} alt="" referrerPolicy="no-referrer" className="rounded-xl" />}
          <AvatarFallback className="rounded-xl bg-brand-soft text-2xl font-semibold text-brand-soft-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">My Profile</h2>
          <p className="mt-1 wrap-break-word text-sm text-muted-foreground">{user.email}</p>
        </div>
      </header>
      <form onSubmit={saveName} className="space-y-5">
        <AccountRow label="Full name" id="profile-name" description="Your display name in Owlio.">
          <Input id="profile-name" aria-describedby="profile-name-description" autoComplete="name" value={name}
            onChange={event => setName(event.target.value)} maxLength={100} required disabled={saving} />
        </AccountRow>
        <AccountActions>
          <Button type="submit" disabled={saving || !name.trim() || name.trim() === savedName}>
            {saving ? 'Saving…' : 'Save name'}
          </Button>
          {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </AccountActions>
      </form>
      <div className="border-t pt-6">
        <AccountRow label="Profile photo" description="JPEG, PNG, or WebP up to 2 MB.">
          <input
            ref={fileInput}
            type="file"
            aria-label="Profile photo file"
            hidden
            accept={avatarTypes.join(',')}
            onChange={event => {
              upload(event.currentTarget.files?.[0])
              event.currentTarget.value = ''
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}
              disabled={!photo?.uploadsAvailable || changingPhoto}>
              <ImagePlus aria-hidden="true" />
              {changingPhoto ? 'Updating photo…' : 'Upload new image'}
            </Button>
            {photo?.source === 'upload' && (
              <Button type="button" variant="destructive" disabled={changingPhoto}
                onClick={() => void changePhoto(removeProfilePhoto, 'Uploaded photo removed.')}>
                <Trash2 aria-hidden="true" /> Remove upload
              </Button>
            )}
          </div>
          <div className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
            {!current && <p role="status">Checking photo availability…</p>}
            {current?.error && (
              <div role="alert" className="flex flex-wrap items-center gap-2">
                <span>{current.error}</span>
                <Button size="sm" variant="outline" onClick={reload}>Try again</Button>
              </div>
            )}
            {photo && !photo.uploadsAvailable && <p>Photo uploads are currently unavailable.</p>}
            {(photo?.source === 'google' || photo?.uploadsAvailable) && (
              <p>{photo.source === 'google' ? 'Using your Google profile photo. ' : ''}
                When available, your Google photo updates when you sign in with Google or link your account.
              </p>
            )}
          </div>
          {photoStatus && <p role="status" className="mt-2 text-sm text-muted-foreground">{photoStatus}</p>}
          {photoError && <p role="alert" className="mt-2 text-sm text-destructive">{photoError}</p>}
        </AccountRow>
      </div>
      <AccountRow label="Connected accounts" description="Manage your Google sign-in connection.">
        <Link className={buttonVariants({ variant: "outline" })} to="../account/security" relative="path">Account security</Link>
      </AccountRow>
    </>
  )
}
