import { useState } from "react"
import { X } from "lucide-react"
import { PrivateFileManager } from "@/components/common/files/private-file-manager"
import { Button } from "@/components/ui/button"
import { useAuthSession } from "@/components/features/auth/context/auth-session-context"
import { DrawerPanel } from "./drawer-panel"
export function LockerFilesPanel({
  spaceId,
  onClose,
}: {
  spaceId: string
  onClose: () => void
}) {
  const { user } = useAuthSession()
  const [deviceFiles, setDeviceFiles] = useState(false)
  if (deviceFiles)
    return (
      <DrawerPanel spaceId={spaceId} onClose={() => setDeviceFiles(false)} />
    )
  return (
    <div
      role="dialog"
      aria-label="My locker"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-y-3 left-3 z-20 flex w-96 max-w-[92%] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">My locker</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close my locker"
        >
          <X aria-hidden="true" />
        </Button>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {user && (
          <PrivateFileManager
            key={`${user.id}:${spaceId}`}
            kind="locker"
            id={spaceId}
            canUpload
            title="Locker files"
          />
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDeviceFiles(true)}
        >
          Files previously saved on this device
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          Previous device files stay on this device until you choose to upload
          them. Other study-space members cannot access your private locker.
        </p>
      </div>
    </div>
  )
}
