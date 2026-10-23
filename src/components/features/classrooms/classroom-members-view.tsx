import { useMemo, useState, type FormEvent } from "react"
import { Check, Search, UserPlus, UserX, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, WorkspaceRole } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"
import { isYou } from "./classroom-utils"

const PAGE_SIZE = 10

export function ClassroomMembersView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { requestMember, resolveMemberRequest, removeMember } = useClassroomPrototype()
  const isStudent = role === "students"
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "educator" | "student">("all")
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("")

  const visibleRequests = classroom.memberRequests.filter((request) =>
    isStudent ? isYou(request.requestedBy) : request.status === "pending",
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return classroom.members.filter((member) =>
      (filter === "all" || member.role === filter) && (!term || member.name.toLowerCase().includes(term)),
    )
  }, [classroom.members, filter, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const handleRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !email.trim()) return
    requestMember(classroom.id, { name, email }, isStudent ? "student" : "educator")
    setName("")
    setEmail("")
    setShowForm(false)
    setStatus(`Request for ${name.trim()} was sent to the educator for approval. Preview only; nothing is saved.`)
  }

  const handleResolve = (requestId: string, requestName: string, decision: "accept" | "decline") => {
    resolveMemberRequest(classroom.id, requestId, decision)
    setStatus(decision === "accept" ? `${requestName} was added to the class (preview only).` : `${requestName}'s request was declined.`)
  }

  const handleRemove = (memberId: string, memberName: string) => {
    removeMember(classroom.id, memberId)
    setStatus(`${memberName} was removed from this class (preview only).`)
  }

  return (
    <section aria-labelledby="members-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="members-heading" className="text-lg font-semibold text-slate-900">Members</h3>
          <p className="mt-1 text-sm text-slate-600">
            {isStudent ? "Suggest a classmate to add. Your educator approves every request." : "Review requests and manage who is in this class."}
          </p>
        </div>
        {isStudent && (
          <Button type="button" aria-expanded={showForm} onClick={() => setShowForm((current) => !current)}>
            <UserPlus aria-hidden="true" /> Add member
          </Button>
        )}
      </div>

      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}

      {showForm && isStudent && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <form onSubmit={handleRequest} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="grid gap-2">
                <Label htmlFor="member-name">Name</Label>
                <Input id="member-name" value={name} onChange={(event) => setName(event.currentTarget.value)} required maxLength={80} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="member-email">Email</Label>
                <Input id="member-email" type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} required maxLength={120} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Send request</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {visibleRequests.length > 0 && (
        <Card>
          <CardContent className="gap-3 p-4">
            <h4 className="text-sm font-semibold text-slate-900">{isStudent ? "Your requests" : "Pending requests"} <span className="font-normal text-slate-500">· {visibleRequests.length}</span></h4>
            <ul className="divide-y divide-slate-100">
              {visibleRequests.map((request) => (
                <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <PersonAvatar name={request.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{request.name}</p>
                      <p className="truncate text-xs text-slate-500">{request.email} · requested by {request.requestedBy}</p>
                    </div>
                  </div>
                  {isStudent ? (
                    <Badge variant="outline" className={request.status === "pending" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-rose-200 bg-rose-50 text-rose-800"}>
                      {request.status === "pending" ? "Awaiting approval" : "Declined"}
                    </Badge>
                  ) : (
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => handleResolve(request.id, request.name, "accept")}><Check aria-hidden="true" /> Accept</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleResolve(request.id, request.name, "decline")}><X aria-hidden="true" /> Decline</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <Label htmlFor="member-filter" className="sr-only">Filter by role</Label>
          <select
            id="member-filter"
            value={filter}
            onChange={(event) => { setFilter(event.currentTarget.value as typeof filter); setPage(0) }}
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="all">All roles</option>
            <option value="educator">Educators</option>
            <option value="student">Students</option>
          </select>
        </div>
        <div className="relative w-full sm:w-72">
          <Label htmlFor="member-search" className="sr-only">Search members by name</Label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input id="member-search" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(0) }} placeholder="Search by name" className="pl-8" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Name</TableHead>
              <TableHead>Role</TableHead>
              {!isStudent && <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={isStudent ? 2 : 3} className="px-4 py-8 text-center text-slate-600">No members match your search.</TableCell></TableRow>
            ) : rows.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <PersonAvatar name={member.name} />
                    <span className="font-medium text-slate-900">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{member.role === "educator" ? "Educator" : "Student"}</Badge>
                </TableCell>
                {!isStudent && (
                  <TableCell>
                    {member.role === "student" && (
                      <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${member.name}`} onClick={() => handleRemove(member.id, member.name)}>
                        <UserX aria-hidden="true" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
          <span>
            Viewing {filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}-{currentPage * PAGE_SIZE + rows.length} of {filtered.length} {filtered.length === 1 ? "member" : "members"}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button>
            <Button type="button" variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
