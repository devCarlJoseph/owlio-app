import type { ReactNode } from "react"
import Footer from "@/components/common/footer"
import Navbar from "@/components/common/navbar"

export default function GuestHomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col overflow-hidden bg-[#f8f9ff] text-slate-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
