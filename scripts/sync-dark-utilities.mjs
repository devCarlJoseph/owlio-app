import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const classes = new Set()
function scan(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name)
    if (item.isDirectory()) scan(path)
    else if (/\.[jt]sx?$/.test(path) && !/\.test\./.test(path)) {
      const source = readFileSync(path, 'utf8')
      for (const match of source.matchAll(/(?:[\w-]+(?:-\[[\w=/-]+\])?:)*(?:bg|text|border|ring|divide|from|via|to)-(?:white|black|[a-z]+-\d{2,3})(?:\/\d+)?/g)) classes.add(match[0])
    }
  }
}
scan('src')
const neutrals = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone'])
const tones = new Set(['blue', 'indigo', 'sky', 'cyan', 'teal', 'emerald', 'green', 'lime', 'yellow', 'amber', 'orange', 'red', 'rose', 'pink', 'violet', 'purple', 'fuchsia'])
const groups = new Map()
for (const name of [...classes].sort()) {
  const parts = name.split(':')
  const base = parts.pop()
  const match = /^(bg|text|border|ring|divide|from|via|to)-(white|black|([a-z]+)-(\d+))(?:\/(\d+))?$/.exec(base)
  if (!match) continue
  const [, kind, color, family, rawShade, rawOpacity] = match
  const shade = Number(rawShade)
  const neutral = neutrals.has(family)
  let value
  if (color === 'white' && kind !== 'text' && (!rawOpacity || Number(rawOpacity) >= 40)) value = kind === 'border' || kind === 'ring' ? 'var(--border)' : 'var(--card)'
  else if (neutral && kind === 'text' && shade >= 400) value = shade >= 700 ? 'var(--foreground)' : 'var(--muted-foreground)'
  else if (neutral && ['border', 'ring', 'divide'].includes(kind) && shade <= 300) value = 'var(--border)'
  else if (neutral && ['bg', 'from', 'via', 'to'].includes(kind) && shade <= 300) value = shade <= 50 ? 'var(--background)' : 'var(--muted)'
  else if (tones.has(family) && ['bg', 'from', 'via', 'to'].includes(kind) && shade <= 300) value = `color-mix(in oklab, var(--color-${family}-400) ${shade >= 200 ? 23 : 12}%, var(--card))`
  else if (tones.has(family) && kind === 'text' && shade >= 600) value = `var(--color-${family}-${shade >= 900 ? 200 : 300})`
  else if (tones.has(family) && ['border', 'ring', 'divide'].includes(kind) && shade <= 300) value = `color-mix(in oklab, var(--color-${family}-400) 35%, var(--border))`
  if (!value) continue
  if (rawOpacity) value = `color-mix(in oklab, ${value} ${rawOpacity}%, transparent)`
  let selector = `.dark [class~="${name}"]:not([data-theme-content], [data-theme-content] *)`
  let media = ''
  for (const variant of parts) {
    if (['sm', 'md', 'lg', 'xl', '2xl'].includes(variant)) media = `@media (min-width: ${{ sm: 40, md: 48, lg: 64, xl: 80, '2xl': 96 }[variant]}rem)`
    else if (['hover', 'focus-visible', 'focus-within', 'active'].includes(variant)) selector += `:${variant}`
    else if (variant === 'group-hover') selector = selector.replace('.dark ', '.dark .group:hover ')
    else if (/^data-\[/.test(variant)) selector += `[data-${variant.slice(6, -1)}]`
    else if (variant === 'data-active') selector += '[data-active]'
    else if (variant === 'tabs-list') selector += ':is([data-slot="tabs-list"] *)'
    else if (variant === 'after') selector += '::after'
    else if (variant === 'file') selector += '::file-selector-button'
    else if (variant === 'placeholder') selector += '::placeholder'
    else if (variant === 'peer-checked') selector = selector.replace('.dark ', '.dark .peer:checked ~ ')
    else if (variant === 'peer-focus-visible') selector = selector.replace('.dark ', '.dark .peer:focus-visible ~ ')
    else { selector = ''; break }
  }
  if (!selector) continue
  const property = { bg: 'background-color', text: 'color', border: 'border-color', ring: '--tw-ring-color', divide: 'border-color', from: '--tw-gradient-from', via: '--tw-gradient-via', to: '--tw-gradient-to' }[kind]
  if (kind === 'divide') selector += ' > :not(:last-child)'
  const key = `${media}|${property}: ${value}`
  const group = groups.get(key) ?? []
  group.push(selector)
  groups.set(key, group)
}
const rules = [...groups].map(([key, selectors]) => {
  const [media, declaration] = key.split('|')
  const rule = `${selectors.join(',\n')} { ${declaration}; }`
  return media ? `${media} {\n${rule}\n}` : rule
})
writeFileSync('src/styles/dark-surfaces.css', `/* Shared dark equivalents for existing palette utilities. New UI should use semantic tokens.
   Regenerate with node scripts/sync-dark-utilities.mjs after introducing legacy palette classes.
   Authored slide and whiteboard content opt out with data-theme-content. */
@layer utilities {\n${rules.join('\n\n')}\n}\n`)
