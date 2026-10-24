import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"

type AvatarStackPerson = { name: string; imageUrl?: string }

const MAX_VISIBLE = 3

export function AvatarStack({ people, total }: { people: AvatarStackPerson[]; total?: number }) {
  const count = Math.max(total ?? people.length, people.length)
  if (count === 0) return null
  const visible = people.slice(0, MAX_VISIBLE)
  const extra = count - visible.length
  const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()

  return (
    <AvatarGroup role="img" aria-label={`${count} ${count === 1 ? "person" : "people"}`}>
      {visible.map((person) => (
        <Avatar key={person.name} className="border-2 border-outline after:hidden">
          {person.imageUrl && <AvatarImage src={person.imageUrl} alt="" />}
          <AvatarFallback className="bg-white text-[10px] font-semibold text-panel-foreground">{initials(person.name)}</AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <AvatarGroupCount className="border-2 border-outline bg-tone-amber-tag text-xs font-semibold text-panel-foreground">+{extra}</AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
