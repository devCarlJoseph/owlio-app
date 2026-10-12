import { useState } from "react"
import { Menu } from "lucide-react"
import { Outlet, useLocation } from "react-router"
import { AppSidebar } from "@/components/common/app-sidebar"
import { Button } from "@/components/ui/button"
import { dashboardNavigation } from "@/components/common/dashboard-navigation"

export default function PlatformLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const currentPage = dashboardNavigation.find(({ href }) => href === pathname)

  return (
    <div className="flex min-h-svh bg-slate-50">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="md:hidden"
          >
            <Menu aria-hidden="true" />
          </Button>
          <h1 className="text-sm font-semibold text-slate-800">{currentPage?.label ?? "Workspace"}</h1>
          <span className="ml-auto hidden text-xs text-slate-500 sm:block">Your learning space</span>
        </header>
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
