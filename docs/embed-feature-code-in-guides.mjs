import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = dirname(fileURLToPath(import.meta.url))
const sourceRoot = join(docsRoot, '../src/components/features')
const guideRoot = join(docsRoot, 'components/features')
const startMarker = '<!-- BEGIN GENERATED CURRENT SOURCE -->'
const endMarker = '<!-- END GENERATED CURRENT SOURCE -->'
const mode = process.argv[2]

if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
  console.error('Usage: node docs/embed-feature-code-in-guides.mjs --write|--check')
  process.exit(1)
}

const posix = path => path.replaceAll('\\', '/')
const isCode = name => /\.(?:tsx?|jsx?|css)$/.test(name)

async function walkDirectories(dir) {
  const result = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const child = join(dir, entry.name)
    result.push(child, ...await walkDirectories(child))
  }
  return result
}

function codeFence(code) {
  const longestRun = [...code.matchAll(/`+/g)].reduce((length, match) => Math.max(length, match[0].length), 0)
  return '`'.repeat(Math.max(3, longestRun + 1))
}

async function section(sourceDir, entry) {
  const sourcePath = join(sourceDir, entry.name)
  const source = (await readFile(sourcePath, 'utf8')).replace(/\r\n?/g, '\n')
  const fence = codeFence(source)
  const language = entry.name.endsWith('.tsx') ? 'tsx' : entry.name.endsWith('.css') ? 'css' : 'ts'
  const path = posix(relative(sourceRoot, sourcePath))
  return `### \`${entry.name}\`\n\nCurrent file: \`src/components/features/${path}\`\n\n${fence}${language}\n${source}${source.endsWith('\n') ? '' : '\n'}${fence}`
}

async function main() {
  const pending = []
  let fileCount = 0
  const directories = await walkDirectories(sourceRoot)
  for (const sourceDir of directories) {
    const path = relative(sourceRoot, sourceDir)
    const guideDir = join(guideRoot, path)
    const readmePath = join(guideDir, 'README.md')
    const readme = await readFile(readmePath, 'utf8')
    const entries = await readdir(sourceDir, { withFileTypes: true })
    const files = entries.filter(entry => entry.isFile() && isCode(entry.name)).sort((a, b) => a.name.localeCompare(b.name))
    const children = entries.filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))
    fileCount += files.length

    const parts = [
      startMarker,
      '',
      `## Current source in \`src/components/features/${posix(path)}/\``,
      '',
      'Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.',
    ]
    if (children.length) {
      parts.push('', '### Nested feature guides', '', ...children.map(entry => `- [\`${entry.name}/\`](${entry.name}/README.md)`))
    }
    if (files.length) {
      for (const entry of files) parts.push('', await section(sourceDir, entry))
    } else {
      parts.push('', 'No TypeScript, JavaScript, or CSS source files are directly in this folder.')
    }
    parts.push('', endMarker)
    const expected = parts.join('\n')

    const start = readme.indexOf(startMarker)
    const end = readme.indexOf(endMarker)
    if ((start < 0) !== (end < 0) || (start >= 0 && (readme.indexOf(startMarker, start + 1) >= 0 || readme.indexOf(endMarker, end + 1) >= 0))) {
      throw new Error(`Invalid generated section markers in ${readmePath}`)
    }
    if (start < 0) {
      if (mode === '--check') throw new Error(`Missing current source section: ${readmePath}`)
      pending.push([readmePath, `${readme.trimEnd()}\n\n${expected}\n`])
    } else if (readme.slice(start, end + endMarker.length) !== expected) {
      throw new Error(`Current source section is stale or edited: ${readmePath}`)
    }
  }

  for (const [path, content] of pending) await writeFile(path, content)
  console.log(`${mode === '--check' ? 'Verified' : 'Embedded'} ${fileCount} complete source files in ${directories.length} matching guide READMEs.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
