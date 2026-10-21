import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"

type ResourceContextLinkProps = {
  href: string
  label: string
  className?: string
}

export function ResourceContextLink({ href, label, className }: ResourceContextLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group/context inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-blue-700 underline-offset-4 outline-none hover:text-blue-800 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className
      )}
    >
      {label}
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform group-hover/context:translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  )
}
