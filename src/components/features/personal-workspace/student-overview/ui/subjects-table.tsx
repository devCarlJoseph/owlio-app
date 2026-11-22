import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function SubjectsTable() {
  return (
    <Card className="border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900 surface-dark:text-foreground">My subjects</h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500 surface-dark:text-muted-foreground">
              Progress and status for each subject you track.
            </CardDescription>
          </div>
          <Button
            render={<Link to="/students/subjects" />}
            variant="secondary"
            size="sm"
            className="border-brand/30"
          >
            Manage subjects
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="gap-4">
        <Table aria-label="Subject progress">
          <TableHeader>
            <TableRow className="bg-slate-50 surface-dark:bg-background hover:bg-slate-50 surface-dark:hover:bg-background">
              <TableHead scope="col" className="text-slate-500 surface-dark:text-muted-foreground">
                Subject
              </TableHead>
              <TableHead scope="col" className="text-slate-500 surface-dark:text-muted-foreground">
                Progress
              </TableHead>
              <TableHead scope="col" className="text-slate-500 surface-dark:text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody aria-hidden="true">
            {[0, 1, 2].map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-lg motion-reduce:animate-none" />
                    <div className="space-y-2">
                      <Skeleton className="h-3.5 w-32 motion-reduce:animate-none" />
                      <Skeleton className="h-3 w-20 motion-reduce:animate-none" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-2 w-28 rounded-full motion-reduce:animate-none" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24 rounded-4xl motion-reduce:animate-none" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-sm leading-5 text-slate-500 surface-dark:text-muted-foreground">
          Your subject list is not connected yet, so there is nothing to show here.
        </p>
      </CardContent>
    </Card>
  )
}