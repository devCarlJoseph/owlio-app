import { useEffect, useRef, useState } from "react"
import { Bell, LogOut, Menu, Search } from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { AppSidebar } from "@/components/common/app-sidebar"
import { BrandWordmark } from "@/components/common/brand-wordmark"
import { chipClassName } from "@/components/common/chip-styles"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  getActiveDashboardHref,
  getDashboardNavigation,
  getDashboardPageTitle,
  getDashboardPrimaryTabs,
} from "@/components/common/dashboard-navigation"
import { ClassroomPrototypeProvider } from "@/components/features/classrooms/classroom-prototype-provider"
import { useAuthSession } from "@/components/features/auth/auth-session-context"
import { getApiErrorMessage } from "@/services/api/api-error"

export default function PlatformLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuthSession()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const pageTitle = getDashboardPageTitle(pathname)
  const primaryTabs = getDashboardPrimaryTabs(pathname)
  const activeHref = getActiveDashboardHref(pathname)
  const navigationItems = getDashboardNavigation(pathname).flatMap(({ label: group, items }) =>
    items.map((item) => ({ ...item, group }))
  )
  const matchingPages = navigationItems.filter(({ label }) =>
    label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )
  const notificationHref = navigationItems.find(({ label }) => label === "Notifications")?.href ?? "/"
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
    <div className="flex h-svh overflow-hidden bg-shell p-3 md:gap-4 md:p-4">
      <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl bg-panel text-panel-foreground md:rounded-panel">
        <header className="z-20 flex shrink-0 flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
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
          <p className="flex min-w-0 items-baseline gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Welcome to</span>
            <BrandWordmark className="text-xl" />
          </p>
          <form
            role="search"
            className="relative ml-auto hidden w-full max-w-sm flex-1 md:block"
            onSubmit={(event) => {
              event.preventDefault()
              if (matchingPages.length === 1) {
                navigate(matchingPages[0].href)
                setSearchQuery("")
              }
            }}
          >
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
              className="h-11 rounded-xl border-2 border-outline bg-white pl-4 pr-24 shadow-none focus-visible:ring-brand/40"
            />
            {!searchQuery && (
              <KbdGroup aria-hidden="true" className="absolute right-14 top-1/2 -translate-y-1/2">
                <Kbd className="border border-slate-200 bg-white text-[10px]">{searchShortcutLabel}</Kbd>
                <Kbd className="border border-slate-200 bg-white text-[10px]">K</Kbd>
              </KbdGroup>
            )}
            <button
              type="submit"
              aria-label="Go to matching page"
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg bg-brand text-brand-foreground outline-none hover:bg-brand-hover focus-visible:ring-3 focus-visible:ring-brand/50"
            >
              <Search aria-hidden="true" className="size-4" />
            </button>
            {searchQuery.trim() && (
              <div id="dashboard-search-results" className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-2xl border-2 border-outline bg-white p-1">
                {matchingPages.length > 0 ? (
                  <ul aria-label="Matching workspace pages" className="space-y-0.5">
                    {matchingPages.map(({ label, href, group }) => (
                      <li key={href}>
                        <Link
                          to={href}
                          onClick={() => setSearchQuery("")}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50 focus-visible:bg-slate-50"
                        >
                          <span>{label}</span>
                          <span className="text-xs text-slate-500">{group}</span>
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
          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <Button
              render={<Link to={notificationHref} />}
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              title="Notifications"
              className="size-10 rounded-full border-2 border-outline bg-white text-panel-foreground hover:bg-slate-100"
            >
              <Bell aria-hidden="true" />
            </Button>
            <div className="flex min-w-0 items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2">
              <Avatar className="size-10 border-2 border-outline after:hidden">
                <AvatarFallback className="bg-tone-amber text-xs font-semibold text-panel-foreground">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden min-w-0 md:block">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-slate-600">{userRoleLabel}</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" disabled={signingOut} onClick={() => void handleSignOut()} className="rounded-full">
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Sign out'}</span>
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">{pageTitle}</h1>
            {primaryTabs.length > 0 && (
              <nav aria-label="Primary" className="-mx-1 overflow-x-auto px-1 py-1 max-md:hidden">
                <ul className="flex gap-2">
                  {primaryTabs.map(({ href, tabLabel }) => (
                    <li key={href}>
                      <Link to={href} aria-current={href === activeHref ? "page" : undefined} className={chipClassName(href === activeHref)}>
                        {tabLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
          <main id="main-content">
            {signOutError && <p className="mb-4 text-sm text-destructive" role="alert">{signOutError}</p>}
            <ClassroomPrototypeProvider>
              <Outlet />
            </ClassroomPrototypeProvider>
          </main>
        </div>
      </div>
    </div>
  )
}
