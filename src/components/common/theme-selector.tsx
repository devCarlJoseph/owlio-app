import { useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTheme, setTheme, subscribeTheme } from '@/lib/theme'

export function ThemeSelector({ expanded }: { expanded: boolean }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => 'system' as const)
  return <fieldset className="mb-2 min-w-0 px-1">
    <legend className={expanded ? 'mb-2 px-2 text-xs font-medium text-muted-foreground' : 'sr-only'}>Theme</legend>
    <div className={expanded ? 'grid grid-cols-3 gap-1 rounded-xl bg-muted p-1' : 'flex flex-col items-center gap-1'}>
      {([{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: Monitor }] as const).map(({ value, label, icon: Icon }) => <Button
        key={value} variant="ghost" size={expanded ? 'sm' : 'icon-sm'} aria-label={`${label} theme`} aria-pressed={theme === value}
        title={label} onClick={() => setTheme(value)}
        className="min-w-0 gap-1.5 px-2 text-xs text-muted-foreground aria-pressed:bg-card aria-pressed:text-brand aria-pressed:shadow-sm"
      ><Icon aria-hidden="true" className="size-4 shrink-0" />{expanded && label}</Button>)}
    </div>
  </fieldset>
}
