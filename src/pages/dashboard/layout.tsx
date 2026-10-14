import { useEffect, useRef, useState } from "react"
import { Bell, LogOut, Menu, Search } from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { AppSidebar } from "@/components/common/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { getDashboardNavigation, getDashboardPageTitle } from "@/components/common/dashboard-navigation"
import { useAuthSession } from "@/components/features/auth/auth-session-context"
import { getApiErrorMessage } from "@/services/api/api-error"

export default function PlatformLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuthSession()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const pageTitle = getDashboardPageTitle(pathname)
  const navigationItems = getDashboardNavigation(pathname).flatMap(({ label: group, items }) =>
    items.map((item) => ({ ...item, group }))
  )
  const matchingPages = navigationItems.filter(({ label }) =>
    label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )
  const notificationHref = navigationItems.find(({ label }) => label === "Notifications")?.href ?? "/"
  const currentDate = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())
  const userInitials = user?.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'OW'
  const userRoleLabel = user?.roles.includes('STUDENT') ? 'Student account' : 'Educator account'
  const isMacPlatform = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
  const searchShortcut = isMacPlatform ? "Meta+K" : "Control+K"
  const searchShortcutLabel = isMacPlatform ? "⌘" : "Ctrl"

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return

      const target = event.target
      if (target instanceof HTMLElement && target !== searchInputRef.current && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return

      const input = searchInputRef.current
      if (!input || input.getClientRects().length === 0) return

      event.preventDefault()
      input.focus()
    }

    window.addEventListener("keydown", handleSearchShortcut)
    return () => window.removeEventListener("keydown", handleSearchShortcut)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    setSignOutError(null)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      setSignOutError(getApiErrorMessage(error, 'Could not sign out. Please try again.'))
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex min-h-svh bg-slate-50">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:gap-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="md:hidden"
          >
            <Menu aria-hidden="true" />
          </Button>
          <div className="min-w-0 shrink-0">
            <h1 className="truncate text-sm font-semibold text-slate-900">{pageTitle}</h1>
            <p className="mt-0.5 text-[11px] text-slate-500">{currentDate}</p>
          </div>
          <form
            role="search"
            className="relative mx-auto hidden w-full max-w-md flex-1 md:block"
            onSubmit={(event) => {
              event.preventDefault()
              if (matchingPages.length === 1) {
                navigate(matchingPages[0].href)
                setSearchQuery("")
              }
            }}
          >
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchQuery("")
              }}
              aria-label="Search workspace pages"
              aria-keyshortcuts={searchShortcut}
              autoComplete="off"
              placeholder="Search pages..."
              className="h-10 rounded-full border-slate-200 bg-slate-50 pl-10 pr-20"
            />
            {!searchQuery && (
              <KbdGroup aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Kbd className="border border-slate-200 bg-white text-[10px]">{searchShortcutLabel}</Kbd>
                <Kbd className="border border-slate-200 bg-white text-[10px]">K</Kbd>
              </KbdGroup>
            )}
            {searchQuery.trim() && (
              <div id="dashboard-search-results" className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {matchingPages.length > 0 ? (
                  <ul aria-label="Matching workspace pages" className="space-y-0.5">
                    {matchingPages.map(({ label, href, group }) => (
                      <li key={href}>
                        <Link
                          to={href}
                          onClick={() => setSearchQuery("")}
                          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
                        >
                          <span>{label}</span>
                          <span className="text-xs text-slate-400">{group}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p role="status" className="px-3 py-2 text-sm text-slate-500">No matching pages.</p>
                )}
              </div>
            )}
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              render={<Link to={notificationHref} />}
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              title="Notifications"
              className="rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100"
            >
              <Bell aria-hidden="true" />
            </Button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-3">
              <Avatar size="sm" className="size-8">
                <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-800">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden min-w-0 md:block">
                <p className="truncate text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="truncate text-[10px] text-slate-500">{userRoleLabel}</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" disabled={signingOut} onClick={() => void handleSignOut()}>
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Sign out'}</span>
            </Button>
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          {signOutError && <p className="mb-4 text-sm text-destructive" role="alert">{signOutError}</p>}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
