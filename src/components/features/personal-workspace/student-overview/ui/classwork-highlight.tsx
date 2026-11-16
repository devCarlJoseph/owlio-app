import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ClassworkHighlight() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <CardTitle>
          <h3 className="text-base font-semibold text-slate-900">Classwork</h3>
        </CardTitle>
        <CardDescription className="mt-1 text-slate-500">
          Activities and quizzes your educator assigned in a classroom.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <ul className="space-y-2" aria-hidden="true">
          {[0, 1].map((row) => (
            <li key={row} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <Skeleton className="size-9 shrink-0 rounded-lg motion-reduce:animate-none" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/5 motion-reduce:animate-none" />
                <Skeleton className="h-3 w-1/4 motion-reduce:animate-none" />
              </div>
              <Skeleton className="h-8 w-16 shrink-0 rounded-md motion-reduce:animate-none" />
            </li>
          ))}
        </ul>
        <p className="text-sm leading-5 text-slate-500">
          Assigned work, submissions, and released results are not connected yet.
        </p>
        <Button
          render={<Link to="/students/classwork" />}
          size="sm"
          className="w-fit bg-blue-700 text-white hover:bg-blue-800"
        >
          View classwork
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}