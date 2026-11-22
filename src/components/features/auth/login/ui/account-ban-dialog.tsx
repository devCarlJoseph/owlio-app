import { ShieldBan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { AccountBanNotice } from '../account-ban-notice'

export function AccountBanDialog({ notice, onClose }: {
  notice: AccountBanNotice | null
  onClose: () => void
}) {
  return (
    <Dialog open={Boolean(notice)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader className="gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <ShieldBan size={22} aria-hidden="true" />
          </span>
          <DialogTitle className="text-xl font-semibold">
            {notice?.kind === 'temporary' ? 'Your account is temporarily banned' :
              notice?.kind === 'permanent' ? 'Your account is permanently banned' : 'Your account is banned'}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {notice?.kind === 'temporary' ? (
              <>
                You can try signing in again after{' '}
                <time dateTime={notice.expiresAt} className="font-medium text-foreground">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(notice.expiresAt))}
                </time>.
              </>
            ) : notice?.kind === 'permanent' ? 'This ban has no automatic expiry.' : 'Owlio has restricted sign-in for this account.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button />}>Return to sign-in</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
