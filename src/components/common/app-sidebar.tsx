import { Link, useLocation } from "react-router"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getDashboardNavigation } from "./dashboard-navigation"

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

        <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-2 pb-3">
          {getDashboardNavigation(pathname).map(({ label: groupLabel, items }) => (
            <section key={groupLabel} className="mb-5">
              <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 ${compact ? "sr-only" : ""}`}>{groupLabel}</p>
              <ul className="space-y-1">
                {items.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href

                  return (
                    <li key={href}>
                      <Link
                        to={href}
                        onClick={onMobileClose}
                        aria-label={compact ? label : undefined}
                        aria-current={active ? "page" : undefined}
                        title={compact ? label : undefined}
                        className={`flex h-10 items-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${compact ? "justify-center px-0" : "gap-3 px-3"} ${active ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                      >
                        <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                        {!compact && <span className="truncate">{label}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </nav>

        <div className="h-px shrink-0 bg-slate-100" />
      </aside>
    </>
  )
}
