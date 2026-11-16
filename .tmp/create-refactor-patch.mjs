import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import ts from 'typescript'

const normalize = value => value.replaceAll('\\', '/')
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = normalize(path.join(directory, entry.name))
  return entry.isDirectory() ? walk(file) : [file]
})
const entries = execFileSync('git', ['ls-tree', '-r', '-z', 'HEAD', '--', 'src', 'docs'], { encoding: 'utf8' }).split('\0').filter(Boolean).map(line => {
  const [metadata, file] = line.split('\t')
  return { file, hash: metadata.split(' ')[2] }
})
const changedDocs = new Set(execFileSync('git', ['diff', '--name-only', '--', 'docs'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n'))
const selected = entries.filter(entry => entry.file.startsWith('src/') || changedDocs.has(entry.file))
const blobs = execFileSync('git', ['cat-file', '--batch'], { input: selected.map(entry => entry.hash).join('\n') + '\n', maxBuffer: 60 * 1024 * 1024 })
const originals = new Map()
let cursor = 0
for (const entry of selected) {
  const end = blobs.indexOf(10, cursor)
  const size = Number(blobs.subarray(cursor, end).toString().split(' ')[2])
  originals.set(entry.file, blobs.subarray(end + 1, end + 1 + size).toString('utf8'))
  cursor = end + 1 + size + 1
}

const current = walk('src')
const categories = /\/(context|ui|forms|view|hooks|utils|contents|types|tests|schemas)(?=\/)/g
const moves = new Map()
for (const old of originals.keys()) {
  if (!old.startsWith('src/components/features/') || !/\.(tsx?|css)$/.test(old) || fs.existsSync(old)) continue
  const matches = current.filter(file => file.replace(categories, '') === old.replace(categories, ''))
  if (matches.length !== 1) throw new Error(`Cannot uniquely map ${old}: ${matches}`)
  moves.set(old, matches[0])
}
const known = new Set([...originals.keys()].filter(file => file.startsWith('src/')))
function resolve(file, specifier) {
  const base = specifier.startsWith('@/') ? 'src/' + specifier.slice(2) : normalize(path.join(path.dirname(file), specifier))
  return [base, ...['.ts', '.tsx', '.css', '/index.ts', '/index.tsx'].map(extension => base + extension)].find(candidate => known.has(candidate))
}
function relocate(old, source) {
  const next = moves.get(old) ?? old
  if (!/\.tsx?$/.test(old)) return source
  const ast = ts.createSourceFile(old, source, ts.ScriptTarget.Latest, true)
  const edits = []
  function visit(node) {
    if (ts.isStringLiteralLike(node) && /^(\.{1,2}\/|@\/)/.test(node.text)) {
      const target = resolve(old, node.text)
      if (target && (moves.has(target) || old !== next)) {
        const destination = moves.get(target) ?? target
        const withoutExtension = /\.(tsx?|css)$/.test(node.text) ? destination : destination.replace(/\.tsx?$/, '')
        let specifier = node.text.startsWith('@/') ? '@/' + withoutExtension.slice(4) : normalize(path.relative(path.dirname(next), withoutExtension))
        if (!specifier.startsWith('@/') && !specifier.startsWith('.')) specifier = './' + specifier
        if (specifier !== node.text) edits.push({ start: node.getStart(ast) + 1, end: node.getEnd() - 1, text: specifier })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end)
  return source
}
const authored = new Set([
  'src/main.tsx', 'src/components/common/theme-selector.tsx',
  'src/components/features/classrooms/view/classrooms-view.tsx',
  'src/components/features/meeting-room/tests/use-native-meeting-data.test.ts',
  'src/components/features/onboarding/tests/onboarding-view.test.tsx',
])
const additions = [
  'src/components/features/README.md',
  'src/components/features/classrooms/hooks/use-classrooms.ts',
  'src/components/features/classrooms/ui/classroom-list-toolbar.tsx',
  'src/context/app-providers.tsx', 'src/context/theme-context.ts', 'src/context/theme-provider.tsx',
  'src/context/tests/theme-provider.test.tsx', 'src/hooks/use-theme.ts',
  'docs/architecture/feature-composition.md',
]
const before = new Map(), after = new Map(), overlaps = []
const equal = (a, b) => a.replaceAll('\r\n', '\n') === b.replaceAll('\r\n', '\n')
for (const [old, original] of originals) {
  if (!old.startsWith('src/')) continue
  if (old === 'src/components/common/theme-controller.tsx') { before.set(old, original); continue }
  const next = moves.get(old) ?? old
  let expected = relocate(old, original)
  if (authored.has(next)) expected = fs.readFileSync(next, 'utf8')
  else if (fs.existsSync(next) && !equal(expected, fs.readFileSync(next, 'utf8'))) overlaps.push(next)
  if (old !== next || !equal(original, expected)) { before.set(old, original); after.set(next, expected) }
}
for (const file of changedDocs) {
  const original = originals.get(file)
  if (original === undefined) throw new Error(`Missing original doc ${file}`)
  let expected = fs.readFileSync(file, 'utf8')
  if (file === 'docs/CLASSROOM_API_INTEGRATION.md') {
    expected = original
    for (const [old, next] of moves) expected = expected.replaceAll(old, next)
    if (!equal(expected, fs.readFileSync(file, 'utf8'))) overlaps.push(file)
  }
  if (!equal(original, expected)) { before.set(file, original); after.set(file, expected) }
}
for (const file of additions) after.set(file, fs.readFileSync(file, 'utf8'))

const scratch = '.tmp/refactor-patch-trees'
for (const [side, tree] of [['before', before], ['after', after]]) {
  for (const [file, source] of tree) {
    const destination = path.join(scratch, side, file)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.writeFileSync(destination, source.replaceAll('\r\n', '\n'))
  }
}
const result = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--binary', '-M', '--', scratch + '/before', scratch + '/after'], { encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 })
if (result.status !== 1) throw new Error(result.stderr || 'Expected a nonempty diff')
const patch = result.stdout.replaceAll(/([ab])\/\.tmp\/refactor-patch-trees\/(?:before|after)\//g, '$1/')
fs.writeFileSync('.tmp/feature-refactor-only.patch', patch)
const paths = [...new Set([...before.keys(), ...after.keys()])].sort()
fs.writeFileSync('.tmp/feature-refactor-files.txt', paths.join('\n') + '\n')
fs.writeFileSync('.tmp/feature-refactor-overlaps.txt', overlaps.join('\n') + '\n')
const absoluteScratch = path.resolve(scratch)
if (!absoluteScratch.startsWith(path.resolve('.tmp') + path.sep)) throw new Error('Scratch must stay under workspace .tmp')
fs.rmSync(absoluteScratch, { recursive: true })
console.log(JSON.stringify({ refactorPaths: paths.length, movedFiles: moves.size, chatEditsExcluded: overlaps, patch: '.tmp/feature-refactor-only.patch', manifest: '.tmp/feature-refactor-files.txt' }, null, 2))
