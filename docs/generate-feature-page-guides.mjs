import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(docsRoot, '..')
const pagesRoot = join(repoRoot, 'src/pages')
const featuresRoot = join(repoRoot, 'src/components/features')
const guidesRoot = join(docsRoot, 'components/features')
const startMarker = '<!-- BEGIN GENERATED PAGE ADAPTERS -->'
const endMarker = '<!-- END GENERATED PAGE ADAPTERS -->'
const sourceMarker = '<!-- BEGIN GENERATED CURRENT SOURCE -->'
const mode = process.argv[2]

if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
  console.error('Usage: node docs/generate-feature-page-guides.mjs --write|--check')
  process.exit(1)
}

const exceptions = new Map([
  ['App.tsx', 'Unused placeholder, not a registered feature route.'],
  ['dashboard/layout.tsx', 'Shared dashboard shell and provider boundary; not a single-view page.'],
  ['dashboard/ai-assistant/index.tsx', 'Inline preview with no owning feature view yet; choose ownership before extracting.'],
  ['dashboard/educators/learners/index.tsx', 'Inline educator learner board; choose its feature owner before extracting.'],
])

const lazyPages = new Map([
  ['dashboard/classroom/meeting-room.lazy.tsx', 'meeting-room'],
  ['dashboard/students/study-spaces/detail/lazy.tsx', 'personal-workspace'],
])

const pendingExtraction = new Map([
  ['dashboard/materials/index.tsx', {
    feature: 'materials', view: 'MaterialsOverviewView', page: 'MaterialsPage', module: 'materials/materials-overview-view',
    note: 'Move the existing role-aware landing content into a materials view first. Preserve educator/ESL role context and preview labels.',
  }],
  ['dashboard/progress/index.tsx', {
    feature: 'progress', view: 'RoleProgressView', page: 'ProgressPage', module: 'progress/role-progress-view',
    note: 'Move the shared progress placeholder into a feature view first; do not mislabel personal work as official grades.',
  }],
  ['dashboard/communication/index.tsx', {
    feature: 'communication', view: 'CommunicationView', page: 'CommunicationPage', module: 'communication/communication-view',
    note: 'This domain has no feature implementation yet. Move the current role-aware placeholder into a feature view before using the adapter below.',
  }],
  ['dashboard/educators/attendance/index.tsx', {
    feature: 'attendance', view: 'EducatorAttendanceView', page: 'EducatorAttendancePage', module: 'attendance/educator-attendance-view',
    note: 'This domain has no feature implementation yet. Move the sample attendance UI into a feature view without implying live presence is official attendance.',
  }],
])

const posix = path => path.replaceAll('\\', '/')

async function walk(dir) {
  const result = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) result.push(...await walk(path))
    else if (entry.isFile() && entry.name.endsWith('.tsx')) result.push(path)
  }
  return result
}

function fenced(code) {
  const longest = [...code.matchAll(/`+/g)].reduce((max, match) => Math.max(max, match[0].length), 0)
  const fence = '`'.repeat(Math.max(3, longest + 1))
  return `${fence}tsx\n${code.replace(/\r\n?/g, '\n').trimEnd()}\n${fence}`
}

async function main() {
  const features = (await readdir(featuresRoot, { withFileTypes: true }))
    .filter(entry => entry.isDirectory()).map(entry => entry.name)
  const pages = new Map(features.map(feature => [feature, []]))
  const unowned = []
  for (const path of await walk(pagesRoot)) {
    const name = posix(relative(pagesRoot, path))
    const code = await readFile(path, 'utf8')
    if (exceptions.has(name)) {
      unowned.push([name, exceptions.get(name)])
      continue
    }
    const owners = [...new Set([...code.matchAll(/@\/components\/features\/([^/]+)/g)].map(match => match[1]))]
    const proposal = pendingExtraction.get(name)
    const feature = proposal?.feature ?? lazyPages.get(name) ?? (owners.length === 1 ? owners[0] : null)
    if (!feature || !pages.has(feature) || (owners.length > 1 && !proposal)) {
      throw new Error(`Unclassified page ${name}: feature imports ${owners.join(', ') || 'none'}`)
    }
    if (!proposal && code.split(/\r?\n/).length > 20) {
      throw new Error(`Page ${name} is not a thin adapter; classify it as pending extraction`)
    }
    pages.get(feature).push({ name, code, proposal })
  }

  const pending = []
  for (const feature of features) {
    const readmePath = join(guidesRoot, feature, 'README.md')
    const readme = await readFile(readmePath, 'utf8')
    const entries = pages.get(feature).sort((a, b) => a.name.localeCompare(b.name))
    const parts = [
      startMarker, '', '## Page adapters (`src/pages/`)', '',
      'Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.',
    ]
    if (!entries.length) {
      parts.push('', 'No dedicated page adapter belongs to this feature today. Do not create a route just to mirror a feature folder.')
    }
    for (const { name, code, proposal } of entries) {
      parts.push('', `### \`src/pages/${name}\``, '')
      if (proposal) {
        parts.push(
          `**Future-only adapter:** \`src/components/features/${proposal.module}.tsx\` does not exist yet. ${proposal.note}`,
          '',
          fenced(`import { ${proposal.view} } from "@/components/features/${proposal.module}"\n\nexport default function ${proposal.page}() {\n  return <${proposal.view} />\n}`),
        )
      } else {
        parts.push('Existing thin adapter (keep its guard, props, or lazy loading when migrating):', '', fenced(code))
      }
    }
    parts.push('', endMarker)
    const expected = parts.join('\n')
    const start = readme.indexOf(startMarker)
    const end = readme.indexOf(endMarker)
    if ((start < 0) !== (end < 0) || (start >= 0 && (readme.indexOf(startMarker, start + 1) >= 0 || readme.indexOf(endMarker, end + 1) >= 0))) {
      throw new Error(`Invalid page guide markers: ${readmePath}`)
    }
    if (start < 0) {
      if (mode === '--check') throw new Error(`Missing page guide: ${readmePath}`)
      const insert = readme.indexOf(sourceMarker)
      if (insert < 0) throw new Error(`Missing current source section: ${readmePath}`)
      pending.push([readmePath, `${readme.slice(0, insert).trimEnd()}\n\n${expected}\n\n${readme.slice(insert)}`])
    } else if (readme.slice(start, end + endMarker.length) !== expected) {
      throw new Error(`Page guide is stale or edited: ${readmePath}`)
    }
  }

  for (const [path, text] of pending) await writeFile(path, text)
  console.log(`${mode === '--check' ? 'Verified' : 'Documented'} ${[...pages.values()].reduce((sum, list) => sum + list.length, 0)} feature pages across ${features.length} guide READMEs; ${unowned.length} shared/unowned pages need separate ownership decisions.`)
  for (const [path, reason] of unowned) console.log(`Not feature-owned: src/pages/${path} - ${reason}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
