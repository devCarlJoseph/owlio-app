import { ArrowUpRight, BookOpen, ChartNoAxesCombined, ClipboardList, GraduationCap } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassroomResultsSection } from "./classroom-results-section"
import { PersonalProgressSection } from "./personal-progress-section"

export function StudentProgressView() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 text-foreground">
      <header className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          <ChartNoAxesCombined aria-hidden="true" className="size-4 text-brand" /> Your learning journey
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Progress &amp; Grades</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          See where your own learning stands, with a separate space for results shared by your educators.
        </p>
      </header>

      <Tabs defaultValue="personal" className="gap-6">
        <div className="border-b border-border pb-3">
          <TabsList aria-label="Progress record source" className="h-auto! w-full p-1 sm:w-auto">
            <TabsTrigger value="personal" className="min-h-11 min-w-0 gap-2 px-2 text-xs motion-reduce:transition-none sm:px-5 sm:text-sm"><BookOpen aria-hidden="true" className="hidden sm:block" />Personal learning</TabsTrigger>
            <TabsTrigger value="classroom" className="min-h-11 min-w-0 gap-2 px-2 text-xs motion-reduce:transition-none sm:px-5 sm:text-sm"><GraduationCap aria-hidden="true" className="hidden sm:block" />Classroom results</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <PersonalProgressSection />
            <aside aria-label="About personal progress" className="space-y-5">
              <Card className="rounded-2xl border border-border shadow-none ring-0">
                <CardHeader className="gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground"><BookOpen aria-hidden="true" className="size-5" /></span>
                  <h2 className="text-base font-semibold">Learning on your terms</h2>
                  <p className="text-sm leading-6 text-muted-foreground">Your personal tasks count here, whether you study independently or belong to a class.</p>
                </CardHeader>
                <CardContent className="gap-2">
                  <Button render={<Link to="/students/subjects" />} variant="outline" className="min-h-11 justify-between">Open My Learning <ArrowUpRight aria-hidden="true" /></Button>
                  <Button render={<Link to="/students/tasks" />} variant="ghost" className="min-h-11 justify-between"><span className="flex items-center gap-2"><ClipboardList aria-hidden="true" />Manage personal tasks</span><ArrowUpRight aria-hidden="true" /></Button>
                </CardContent>
              </Card>
              <div className="rounded-2xl bg-muted/50 p-5 text-sm leading-6">
                <h2 className="font-medium">A snapshot, not a grade</h2>
                <p className="mt-2 text-muted-foreground">Task completion reflects your current personal list. It doesn’t measure mastery or change classroom grades and attendance.</p>
              </div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="classroom"><ClassroomResultsSection /></TabsContent>
      </Tabs>
    </div>
  )
}
