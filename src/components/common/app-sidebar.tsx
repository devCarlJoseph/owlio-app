import { Link, useLocation } from "react-router"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getDashboardRole, getDashboardSidebarNavigation } from "./dashboard-navigation"

type SidebarGroup = ReturnType<typeof getDashboardSidebarNavigation>[number]

function SidebarNavigationGroup({
  group,
  collapsed,
  activeHref,
  onMobileClose,
}: {
  group: SidebarGroup
  collapsed: boolean
  activeHref?: string
  onMobileClose: () => void
}) {
  return (
    <section key={group.label} className="mb-5">
      {group.showLabel !== false && (
        <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 ${collapsed ? "sr-only" : ""}`}>
          {group.label}
        </p>
      )}
      <ul className="space-y-1">
        {group.items.map(({ label, href, icon: Icon }) => {
          const active = href !== undefined && href === activeHref
          const className = `flex h-10 items-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          } ${
            active
              ? "bg-blue-50 font-semibold text-blue-700"
              : href
                ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                : "cursor-not-allowed text-slate-400"
          }`
          const content = (
            <>
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              {!collapsed && (
                <>
                  <span className="truncate">{label}</span>
                  {!href && (
                    <span aria-hidden="true" className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      Planned
                    </span>
                  )}
                </>
              )}
            </>
          )

          return (
            <li key={href ?? `${group.label}-${label}`}>
              {href ? (
                <Link
                  to={href}
                  onClick={onMobileClose}
                  aria-label={collapsed ? label : undefined}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? label : undefined}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-label={`${label}, planned`}
                  title={`${label} — Planned`}
                  className={className}
                >
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
  collapsed: boolean
  mobileOpen: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onMobileClose: () => void
}

export function AppSidebar({ collapsed, mobileOpen, onCollapsedChange, onMobileClose }: AppSidebarProps) {
  const { pathname } = useLocation()
  const compact = collapsed && !mobileOpen
  const widthClassName = collapsed ? "md:w-[72px]" : "md:w-64"
  const navigationGroups = getDashboardSidebarNavigation(pathname)
  const role = getDashboardRole(pathname)
  const matchedItems = navigationGroups
    .flatMap(({ items }) => items)
    .filter(({ href }) => (
      href !== undefined
      && (pathname === href || (href !== `/${role}` && pathname.startsWith(`${href}/`)))
    ))
    .sort((first, second) => (second.href?.length ?? 0) - (first.href?.length ?? 0))
  const activeHref = matchedItems[0]?.href
  const mainGroups = navigationGroups.filter(({ placement }) => placement !== "footer")
  const footerGroups = navigationGroups.filter(({ placement }) => placement === "footer")

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-slate-950/25 md:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:top-0 md:h-svh md:translate-x-0 ${widthClassName}`} aria-label="Workspace sidebar">
        <div className={`flex h-14 shrink-0 items-center ${compact ? "justify-center px-2" : "justify-between px-3"}`}>
          <Link to="/" aria-label="Owlio home" onClick={onMobileClose} className="flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <img src="/mascot/owlio-mark.png" alt="" className="size-8 shrink-0 object-contain" />
            {!compact && <span className="truncate text-lg font-bold tracking-tight text-blue-700">Owlio</span>}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={collapsed ? "absolute right-1 top-3 hidden md:inline-flex" : "hidden md:inline-flex"}
          >
            {collapsed ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onMobileClose} aria-label="Close navigation" className="md:hidden">
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className={`mx-2 mb-5 flex min-h-12 items-center rounded-xl bg-slate-50 ${compact ? "justify-center" : "gap-3 px-2.5"}`}>
          <Avatar size="sm" className="ring-2 ring-white">
            <AvatarFallback className="bg-emerald-100 text-[10px] font-semibold text-emerald-800">OW</AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">Your workspace</p>
              <p className="truncate text-[11px] text-slate-500">Learning account</p>
            </div>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <nav aria-label="Workspace navigation" className="h-full overflow-x-hidden px-2 pb-3">
            {mainGroups.map((group) => (
              <SidebarNavigationGroup
                key={group.label}
                group={group}
                collapsed={compact}
                activeHref={activeHref}
                onMobileClose={onMobileClose}
              />
            ))}
          </nav>
        </ScrollArea>

        {footerGroups.length > 0 && (
          <div className="shrink-0 border-t border-slate-100 px-2 py-3">
            <nav aria-label="Account navigation">
              {footerGroups.map((group) => (
                <SidebarNavigationGroup
                  key={group.label}
                  group={group}
                  collapsed={compact}
                  activeHref={activeHref}
                  onMobileClose={onMobileClose}
                />
              ))}
            </nav>
          </div>
        )}
      </aside>
    </>
  )
}
