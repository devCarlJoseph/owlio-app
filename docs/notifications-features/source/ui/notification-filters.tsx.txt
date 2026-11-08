import { TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NotificationFilters() {
  return (
    <TabsList activateOnFocus aria-label="Filter notifications" className="h-9 gap-0.5 rounded-lg bg-transparent p-0">
      <TabsTrigger value="all" className="min-w-11 rounded-lg px-2.5 text-xs data-active:bg-muted data-active:shadow-none">All</TabsTrigger>
      <TabsTrigger value="unread" className="min-w-16 rounded-lg px-2.5 text-xs data-active:bg-muted data-active:shadow-none">Unread</TabsTrigger>
    </TabsList>
  )
}
