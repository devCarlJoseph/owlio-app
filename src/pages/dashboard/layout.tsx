import { useEffect, useRef, useState } from "react"
import { Bell, CircleHelp, LogOut, Menu, Search, Settings, ShieldCheck, UserRound, type LucideIcon } from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { AppSidebar } from "@/components/common/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getDashboardNavigation,
  getDashboardPageTitle,
  getDashboardSidebarNavigation,
  getDashboardWorkspace,
} from "@/components/common/dashboard-navigation"
import { ClassroomPrototypeProvider } from "@/components/features/classrooms/classroom-prototype-provider"
import { useAuthSession } from "@/components/features/auth/auth-session-context"
import { getApiErrorMessage } from "@/services/api/api-error"

type MenuEntry = { label: string; href?: string; icon: LucideIcon }

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
  const homeHref = getDashboardWorkspace(pathname)?.homeHref ?? "/"
  const navigationItems = getDashboardNavigation(pathname).flatMap(({ label: group, items }) =>
    items.map((item) => ({ ...item, group }))
  )
  const matchingPages = navigationItems.filter(({ label }) =>
    label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  )
  const notificationHref = navigationItems.find(({ label }) => label === "Notifications")?.href ?? "/"
  const menuItems = getDashboardSidebarNavigation(pathname).flatMap(({ items }) => items)
  const findHref = (...labels: string[]) => menuItems.find(({ label, href }) => href && labels.includes(label))?.href
  const profileHref = findHref("Profile & Settings")
  const accountEntries: MenuEntry[] = [
    { label: profileHref ? "Profile & Settings" : "My Profile", href: profileHref, icon: UserRound },
    ...(profileHref ? [] : [{ label: "Settings", icon: Settings }]),
    { label: "Account security", href: findHref("Account security"), icon: ShieldCheck },
    { label: "Notifications", href: findHref("Notifications"), icon: Bell },
  ]
  const supportEntries: MenuEntry[] = [{ label: "Help & support", href: findHref("Help & Support", "Help & support"), icon: CircleHelp }]
  const workspaceLabel = getDashboardWorkspace(pathname)?.label
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
    <div data-dashboard-shell className="flex h-dvh flex-col overflow-clip bg-slate-50">
      <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:gap-4 sm:px-6">
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
          <Link to={homeHref} aria-label="Owlio home" className="flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <img src="/mascot/owlio-mark.png" alt="" className="size-8 object-contain" />
            <span className="hidden text-lg font-semibold tracking-tight text-slate-950 sm:inline">owlio<span className="text-brand">.</span></span>
          </Link>
          <form
            role="search"
            className="relative mx-auto hidden w-full max-w-xl flex-1 md:block"
            onSubmit={(event) => {
              event.preventDefault()
              if (matchingPages.length === 1) {
                navigate(matchingPages[0].href)
                setSearchQuery("")
              }
            }}
          >
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
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
              placeholder="Search pages…"
              className="h-10 rounded-full border-transparent bg-slate-100 pl-10 pr-20 focus-visible:border-brand focus-visible:bg-white focus-visible:ring-brand/30"
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
              className="relative size-10 rounded-full text-slate-600 hover:bg-slate-100"
            >
              <Bell aria-hidden="true" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Avatar className="size-10">
                  <AvatarFallback className="bg-brand-soft text-sm font-semibold text-brand-soft-foreground">{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-xl p-0">
                <div className="space-y-1.5 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="truncate text-sm text-slate-600">{user?.email}</p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <Badge variant="secondary" className="rounded-md">{userRoleLabel}</Badge>
                    {workspaceLabel && <Badge variant="secondary" className="rounded-md">{workspaceLabel}</Badge>}
                  </div>
                </div>
                {[accountEntries, supportEntries].map((entries, index) => (
                  <div key={index}>
                    <DropdownMenuSeparator className="m-0" />
                    <div className="p-1">
                      {entries.map(({ label, href, icon: Icon }) => (
                        <DropdownMenuItem
                          key={label}
                          disabled={!href}
                          render={href ? <Link to={href} /> : undefined}
                          className="h-10 gap-3 px-3"
                        >
                          <Icon className="size-4.5" aria-hidden="true" />
                          {label}
                          {!href && <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-500">Planned</span>}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                ))}
                <DropdownMenuSeparator className="m-0" />
                <div className="p-1">
                  <DropdownMenuItem variant="destructive" disabled={signingOut} onClick={() => void handleSignOut()} className="h-10 gap-3 px-3">
                    <LogOut className="size-4.5" aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Log out"}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <ScrollArea className="h-full min-h-0 min-w-0 flex-1">
          <main id="main-content" className="p-4 sm:p-6 lg:p-8">
            <h1 className="sr-only">{pageTitle}</h1>
            {signOutError && <p className="mb-4 text-sm text-destructive" role="alert">{signOutError}</p>}
            <ClassroomPrototypeProvider>
              <Outlet />
            </ClassroomPrototypeProvider>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}
