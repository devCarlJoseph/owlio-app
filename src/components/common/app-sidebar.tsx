import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Link, useLocation } from "react-router"
import { Home, PanelLeftClose, PanelLeftOpen, X } from "lucide-react"
import { cn } from "cn"
import { getActiveDashboardHref, getDashboardSidebarNavigation, getDashboardWorkspace } from "./dashboard-navigation"

type SidebarGroup = ReturnType<typeof getDashboardSidebarNavigation>[number]

const STORAGE_KEY = "owlio.sidebar.expanded"
const DESKTOP_QUERY = "(min-width: 1024px)"

function readStoredExpanded() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "false"
  } catch {
    return true
  }
}

function writeStoredExpanded(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    return
  }
}

function useIsDesktop() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(DESKTOP_QUERY)
      query.addEventListener("change", notify)
      return () => query.removeEventListener("change", notify)
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  )
}

function CountBadge({ count, showLabels }: { count?: number; showLabels: boolean }) {
  if (!count) return null
  if (!showLabels) return <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-white" />
  return (
    <span aria-label={`${count} unread`} className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold leading-5 text-brand-foreground">
      {count}
    </span>
  )
}

function SidebarNavigationGroup({
  group,
  showLabels,
  activeHref,
  badges,
  onNavigate,
}: {
  group: SidebarGroup
  showLabels: boolean
  activeHref?: string
  badges?: Record<string, number>
  onNavigate: () => void
}) {
  return (
    <section className="py-2 not-first:border-t not-first:border-slate-200">
      {group.showLabel !== false && (
        <p className={cn("mb-1 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500", !showLabels && "sr-only")}>
          {group.label}
        </p>
      )}
      <ul className={cn("space-y-0.5", !showLabels && "flex flex-col items-center")}>
        {group.items.map(({ label, href, icon: Icon }) => {
          const active = href !== undefined && href === activeHref
          const className = cn(
            "relative flex items-center rounded-lg text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand",
            showLabels ? "h-10 w-full gap-3 px-3" : "size-11 justify-center",
            active
              ? "bg-brand-soft font-medium text-brand-soft-foreground"
              : href
                ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                : "cursor-not-allowed text-slate-400"
          )
          const content = (
            <>
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {showLabels && <span className="truncate">{label}</span>}
              {href && <CountBadge count={badges?.[href]} showLabels={showLabels} />}
              {!href && showLabels && (
                <span aria-hidden="true" className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Planned
                </span>
              )}
            </>
          )

          return (
            <li key={href ?? `${group.label}-${label}`} className="w-full list-none">
              {href ? (
                <Link
                  to={href}
                  onClick={onNavigate}
                  aria-label={showLabels ? undefined : label}
                  aria-current={active ? "page" : undefined}
                  title={showLabels ? undefined : label}
                  className={cn(className, !showLabels && "mx-auto")}
                >
                  {content}
                </Link>
              ) : (
                <button type="button" disabled aria-label={`${label}, planned`} title={`${label} — Planned`} className={cn(className, !showLabels && "mx-auto")}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

type AppSidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
  badges?: Record<string, number>
}

export function AppSidebar({ mobileOpen, onMobileClose, badges }: AppSidebarProps) {
  const { pathname } = useLocation()
  const isDesktop = useIsDesktop()
  const [expanded, setExpanded] = useState(readStoredExpanded)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navigationGroups = getDashboardSidebarNavigation(pathname)
  const workspace = getDashboardWorkspace(pathname)
  const activeHref = getActiveDashboardHref(pathname)
  const mainGroups = navigationGroups.filter(({ placement }) => placement !== "footer")
  const footerGroups = navigationGroups.filter(({ placement }) => placement === "footer")
  const overlayActive = !isDesktop && overlayOpen
  const showLabels = mobileOpen || (isDesktop ? expanded : overlayOpen)
  const WorkspaceIcon = workspace?.icon

  useEffect(() => {
    if (!overlayActive) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOverlayOpen(false)
      toggleRef.current?.focus()
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !asideRef.current?.contains(event.target)) setOverlayOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("pointerdown", handlePointerDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [overlayActive])

  const toggleExpanded = () => {
    if (isDesktop) {
      const next = !expanded
      setExpanded(next)
      writeStoredExpanded(next)
    } else {
      setOverlayOpen((open) => !open)
    }
  }

  const handleNavigate = () => {
    onMobileClose()
    setOverlayOpen(false)
  }

  const toggleLabel = showLabels ? "Collapse sidebar" : "Expand sidebar"

  return (
    <>
      {mobileOpen && (
        <button type="button" aria-label="Close navigation" onClick={onMobileClose} className="fixed inset-0 z-30 bg-slate-950/25 md:hidden" />
      )}
      <div className={cn("shrink-0 md:w-20", expanded && "lg:w-64")}>
        <aside
          ref={asideRef}
          aria-label="Workspace sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-3 pt-3 transition-transform duration-200 motion-reduce:transition-none",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            "md:relative md:h-full md:translate-x-0 md:transition-[width]",
            showLabels ? "md:w-64" : "md:w-20",
            overlayActive && "md:shadow-xl"
          )}
        >
          <div className="flex shrink-0 items-center gap-2">
            {workspace && (
              <Link
                to={workspace.homeHref}
                onClick={handleNavigate}
                aria-label={showLabels ? undefined : "Home"}
                title={showLabels ? undefined : "Home"}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand",
                  showLabels ? "flex-1" : "mx-auto w-12"
                )}
              >
                <Home className="size-5" aria-hidden="true" />
                {showLabels && <span>Home</span>}
              </Link>
            )}
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close navigation"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand md:hidden"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {workspace && WorkspaceIcon && (
            <div className={cn("mt-3 flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50", showLabels ? "h-12 gap-3 px-2" : "mx-auto size-12 justify-center")} title={showLabels ? undefined : workspace.label}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                <WorkspaceIcon className="size-4.5" aria-hidden="true" />
              </span>
              {showLabels ? <span className="truncate text-sm font-medium text-slate-700">{workspace.label}</span> : <span className="sr-only">{workspace.label}</span>}
            </div>
          )}

          <nav aria-label="Workspace navigation" className="mt-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-slate-200 pt-2 [scrollbar-width:thin]">
            {mainGroups.map((group) => (
              <SidebarNavigationGroup key={group.label} group={group} showLabels={showLabels} activeHref={activeHref} badges={badges} onNavigate={handleNavigate} />
            ))}
          </nav>

          <div className="shrink-0 border-t border-slate-200 py-2">
            {footerGroups.length > 0 && (
              <nav aria-label="Account navigation">
                {footerGroups.map((group) => (
                  <SidebarNavigationGroup key={group.label} group={group} showLabels={showLabels} activeHref={activeHref} badges={badges} onNavigate={handleNavigate} />
                ))}
              </nav>
            )}
            <button
              ref={toggleRef}
              type="button"
              onClick={toggleExpanded}
              aria-expanded={showLabels}
              aria-label={toggleLabel}
              title={toggleLabel}
              className={cn(
                "hidden items-center rounded-lg text-sm font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand md:flex",
                showLabels ? "h-10 w-full gap-3 px-3" : "mx-auto size-11 justify-center"
              )}
            >
              {showLabels ? <PanelLeftClose className="size-5" aria-hidden="true" /> : <PanelLeftOpen className="size-5" aria-hidden="true" />}
              {showLabels && <span>Collapse</span>}
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
