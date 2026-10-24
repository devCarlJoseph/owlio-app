import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Link, useLocation } from "react-router"
import { ChevronsLeft, ChevronsRight, X } from "lucide-react"
import { cn } from "cn"
import { getActiveDashboardHref, getDashboardSidebarNavigation } from "./dashboard-navigation"

type SidebarGroup = ReturnType<typeof getDashboardSidebarNavigation>[number]

const STORAGE_KEY = "owlio.sidebar.expanded"
const DESKTOP_QUERY = "(min-width: 1024px)"

function readStoredExpanded() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    return false
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

function SidebarNavigationGroup({
  group,
  showLabels,
  activeHref,
  onNavigate,
}: {
  group: SidebarGroup
  showLabels: boolean
  activeHref?: string
  onNavigate: () => void
}) {
  return (
    <section className="py-2 first:pt-0 not-first:border-t not-first:border-shell-hover">
      {group.showLabel !== false && (
        <p className={cn("mb-1.5 px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-shell-muted", !showLabels && "sr-only")}>
          {group.label}
        </p>
      )}
      <ul className={cn("space-y-1", !showLabels && "flex flex-col items-center")}>
        {group.items.map(({ label, href, icon: Icon }) => {
          const active = href !== undefined && href === activeHref
          const className = cn(
            "flex items-center rounded-xl text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white",
            showLabels ? "h-10 w-full gap-3 px-3" : "size-11 justify-center",
            active
              ? "bg-shell-accent font-semibold text-shell-accent-foreground"
              : href
                ? "text-shell-muted hover:bg-shell-hover hover:text-white"
                : "cursor-not-allowed text-shell-muted/50"
          )
          const content = (
            <>
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {showLabels && (
                <>
                  <span className="truncate">{label}</span>
                  {!href && (
                    <span aria-hidden="true" className="ml-auto rounded-md bg-shell-hover px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-shell-muted">
                      Planned
                    </span>
                  )}
                </>
              )}
            </>
          )

          return (
            <li key={href ?? `${group.label}-${label}`} className={showLabels ? undefined : "list-none"}>
              {href ? (
                <Link
                  to={href}
                  onClick={onNavigate}
                  aria-label={showLabels ? undefined : label}
                  aria-current={active ? "page" : undefined}
                  title={showLabels ? undefined : label}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button type="button" disabled aria-label={`${label}, planned`} title={`${label} — Planned`} className={className}>
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
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const { pathname } = useLocation()
  const isDesktop = useIsDesktop()
  const [expanded, setExpanded] = useState(readStoredExpanded)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const navigationGroups = getDashboardSidebarNavigation(pathname)
  const activeHref = getActiveDashboardHref(pathname)
  const mainGroups = navigationGroups.filter(({ placement }) => placement !== "footer")
  const footerGroups = navigationGroups.filter(({ placement }) => placement === "footer")
  const overlayActive = !isDesktop && overlayOpen
  const showLabels = mobileOpen || (isDesktop ? expanded : overlayOpen)

  const closeOverlay = useCallback(() => setOverlayOpen(false), [])

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
    closeOverlay()
  }

  const toggleLabel = showLabels ? "Collapse sidebar" : "Expand sidebar"

  return (
    <>
      {mobileOpen && (
        <button type="button" aria-label="Close navigation" onClick={onMobileClose} className="fixed inset-0 z-30 bg-slate-950/50 md:hidden" />
      )}
      <div className={cn("relative shrink-0 md:w-16", expanded && "lg:w-60")}>
        <aside
          ref={asideRef}
          aria-label="Workspace sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-shell p-3 text-shell-foreground transition-transform duration-200 motion-reduce:transition-none",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            "md:absolute md:translate-x-0 md:p-0",
            showLabels ? "md:w-60" : "md:w-16",
            overlayActive && "md:rounded-3xl md:bg-shell md:p-2 md:shadow-2xl md:shadow-black/40"
          )}
        >
          <div className={cn("flex h-14 shrink-0 items-center", showLabels ? "justify-between px-1" : "justify-center")}>
            <Link to="/" aria-label="Owlio home" onClick={handleNavigate} className="flex min-w-0 items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white">
              <img src="/mascot/owlio-mark.png" alt="" className="size-9 shrink-0 object-contain" />
              {showLabels && <span className="truncate text-lg font-bold tracking-tight">owlio<span className="text-indigo-300">.</span></span>}
            </Link>
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close navigation"
              className="inline-flex size-9 items-center justify-center rounded-xl text-shell-muted outline-none hover:bg-shell-hover hover:text-white focus-visible:ring-2 focus-visible:ring-white md:hidden"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Workspace navigation" className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-2 [scrollbar-width:none]">
            {mainGroups.map((group) => (
              <SidebarNavigationGroup key={group.label} group={group} showLabels={showLabels} activeHref={activeHref} onNavigate={handleNavigate} />
            ))}
          </nav>

          <div className="shrink-0 border-t border-shell-hover pt-2">
            {footerGroups.length > 0 && (
              <nav aria-label="Account navigation">
                {footerGroups.map((group) => (
                  <SidebarNavigationGroup key={group.label} group={group} showLabels={showLabels} activeHref={activeHref} onNavigate={handleNavigate} />
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
                "hidden items-center rounded-xl text-shell-muted outline-none transition-colors hover:bg-shell-hover hover:text-white focus-visible:ring-2 focus-visible:ring-white md:flex",
                showLabels ? "h-10 w-full gap-3 px-3 text-sm" : "mx-auto size-11 justify-center"
              )}
            >
              {showLabels ? <ChevronsLeft className="size-5" aria-hidden="true" /> : <ChevronsRight className="size-5" aria-hidden="true" />}
              {showLabels && <span>Collapse</span>}
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
