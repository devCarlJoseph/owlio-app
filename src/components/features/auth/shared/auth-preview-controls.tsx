import { Button } from "@/components/ui/button"

type PreviewOption<State extends string> = {
  value: State
  label: string
}

type AuthPreviewControlsProps<State extends string> = {
  options: readonly PreviewOption<State>[]
  onSelect: (state: State) => void
}

export function AuthPreviewControls<State extends string>({ options, onSelect }: AuthPreviewControlsProps<State>) {
  return (
    <details className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Preview UI states
      </summary>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">These controls only show design previews. They do not send a request or change account state.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(({ value, label }) => (
          <Button key={value} type="button" size="sm" variant="outline" onClick={() => onSelect(value)}>
            {label}
          </Button>
        ))}
      </div>
    </details>
  )
}
