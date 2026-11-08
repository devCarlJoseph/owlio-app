import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProgressSummary() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <CardTitle>
          <h3 className="text-base font-semibold text-slate-900">Learning at a glance</h3>
        </CardTitle>
        <CardDescription className="mt-1 text-slate-500">Overall completion across your workspace.</CardDescription>
        <Badge variant="outline" className="mt-2 w-fit border-slate-200 bg-slate-50 text-slate-600">
          Not connected
        </Badge>
      </CardHeader>
      <CardContent className="items-center gap-4">
        <div className="relative w-full max-w-56">
          <svg viewBox="0 0 200 124" className="w-full" role="presentation" aria-hidden="true" focusable="false">
            <path
              d="M20 110 A 80 80 0 0 1 180 110"
              fill="none"
              strokeWidth="18"
              strokeLinecap="round"
              className="stroke-slate-100"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-2 flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-24 motion-reduce:animate-none" />
            <Skeleton className="h-3 w-32 motion-reduce:animate-none" />
          </div>
        </div>
        <p className="text-center text-sm leading-5 text-slate-500">
          Study activity and completion totals are not connected yet.
        </p>
        <Button render={<Link to="/students/progress" />} variant="outline" size="sm" className="w-fit">
          View progress
        </Button>
      </CardContent>
    </Card>
  )
}