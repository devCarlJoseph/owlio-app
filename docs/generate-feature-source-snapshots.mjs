import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// These allocations are the proposed folders in the per-feature manuals.
// Keys are feature names and target folders; values are current source filenames.
const allocations = {
  auth: {
    context: 'auth-session-context.ts auth-session-provider.tsx auth-session-provider.test.tsx',
    view: 'no-workspace-view.tsx require-auth.tsx require-guest.tsx require-role.tsx session-boundary.tsx preview-route-access.test.tsx route-guards.test.tsx',
    'account-security/view': 'account-security-view.tsx',
    'email-verification/forms': 'email-verification.schema.ts email-verification.schema.test.ts resend-verification-form.tsx verification-code-form.tsx',
    'email-verification/view': 'email-verification-view.tsx',
    'forgot-password/forms': 'forgot-password-form.tsx forgot-password.schema.ts',
    'forgot-password/view': 'forgot-password-view.tsx',
    'google/view': 'google-oauth-callback-view.tsx google-oauth-callback-view.test.tsx',
    'login/forms': 'login-form.tsx login.schema.ts',
    'login/view': 'login-view.tsx',
    'password-reset/forms': 'password-reset-form.tsx password-reset.schema.ts',
    'password-reset/view': 'password-reset-view.tsx',
    'register/forms': 'account-type-selector.tsx register-form.tsx register.schema.ts',
    'register/view': 'register-view.tsx',
    'shared/contents': 'auth-showcase-content.ts',
    'shared/utils': 'auth-input-styles.ts development-action-path.ts password-rules.ts',
    'shared/ui': 'auth-brand-panel.tsx auth-feedback.tsx auth-form-actions.tsx auth-layout.tsx auth-password-input.tsx auth-preview-controls.tsx auth-showcase-layout.tsx auth-showcase.tsx auth-split-layout.tsx auth-status-page.tsx google-auth-button.tsx google-auth-button.test.tsx owlio-owl.tsx password-field.tsx password-guidance.tsx session-expired-state.tsx',
  },
  classrooms: {
    context: 'classroom-prototype-context.ts classroom-prototype-provider.tsx classroom-preview-provider.tsx classroom-preview-store.ts',
    contents: 'classroom-covers.ts classroom-list-meta.ts classroom-preview-data.ts discussion-reaction-data.ts',
    forms: 'chat-composer.tsx classroom-form-dialogs.tsx discussion-composer.tsx quiz-timer-settings.tsx',
    ui: 'chat-header.tsx chat-message-bubble.tsx classroom-card.tsx classroom-list-ui.tsx classroom-preview-notice.tsx classroom-ui.tsx discussion-post.tsx discussion-reactions.tsx discussion-text.tsx quiz-countdown.tsx quiz-leaderboard.tsx quiz-questions.tsx quiz-result-card.tsx quiz-timing-badges.tsx',
    utils: 'classroom-utils.ts quiz-answers.ts quiz-timing.ts quiz-timing.test.ts',
    hooks: 'use-now.ts',
    view: 'classroom-activity-view.tsx classroom-chat-view.tsx classroom-chat.test.tsx classroom-classwork-view.tsx classroom-detail-view.tsx classroom-detail-tabs.test.tsx classroom-discussion.test.tsx classroom-feed-view.tsx classroom-members-view.tsx classroom-members-view.test.tsx classroom-preview.test.tsx classroom-quiz.test.tsx classroom-records-view.tsx classrooms-view.tsx classrooms-view-accessibility.test.tsx classrooms-view.test.tsx quiz-workspace.tsx',
    tests: 'classroom-test-data.ts classroom-test-fixtures.tsx',
    '.': 'classroom-types.ts',
  },
  'dashboard-overview': {
    ui: 'overview-identity-card.tsx overview-sidebar.tsx overview-summary.tsx overview-workspaces.tsx',
    view: 'dashboard-overview.tsx dashboard-overview.test.tsx',
    '.': 'overview-types.ts',
  },
  'educator-overview': {
    contents: 'educator-overview-content.ts',
    view: 'educator-overview-view.tsx',
  },
  'esl-teaching': {
    'activities/view': 'esl-activities-view.tsx',
    'attendance/view': 'esl-attendance-view.tsx',
    'learners/view': 'esl-learners-view.tsx',
    'lesson-plans/view': 'esl-lesson-plans-view.tsx',
    'materials/view': 'esl-material-context-view.tsx',
    'meeting-room/ui': 'esl-whiteboard-canvas.tsx',
    'meeting-room/utils': 'esl-whiteboard-model.ts esl-whiteboard-preview-route.ts',
    'meeting-room/view': 'esl-whiteboard-preview.tsx esl-whiteboard-preview.test.tsx',
    'overview/contents': 'esl-overview-content.ts',
    'overview/view': 'esl-overview-view.tsx',
  },
  materials: {
    forms: 'library-search-field.tsx resource-source-filter.tsx',
    ui: 'library-category-row.tsx library-context-cards.tsx library-gallery-card.tsx library-theme.module.css resource-card.tsx resource-list-row.tsx resource-list.tsx',
    view: 'student-library-source-view.tsx student-library-subject-view.tsx student-library-subject-view.test.tsx student-library-view.tsx student-library-view.test.tsx',
    'pending-split': 'library-records.ts',
    '.': 'library-types.ts',
    'workspace/view': 'document-editor.tsx library-workspace-view.tsx library-workspace.test.tsx personal-library-work.tsx presentation-editor.tsx',
    'workspace/model': 'work-drafts.ts work-records.ts',
  },
  'meeting-room': {
    contents: 'classroom-meeting-preview.ts coaching-meeting-preview.ts',
    ui: 'audio-track.tsx coaching-meeting-parts.tsx meeting-whiteboard.tsx meeting-room-panels.tsx participant-tile.tsx',
    utils: 'meeting-grid.ts meeting-whiteboard-model.ts',
    hooks: 'use-participant-video.ts',
    view: 'classroom-meeting-screen.tsx coaching-meeting-screen.tsx meeting-room-hub.tsx meeting-room-hub.test.tsx meeting-room-screen.tsx meeting-room-screen.test.tsx meeting-room-view.tsx',
    '.': 'meeting-room-types.ts',
  },
  notifications: {
    contents: 'notifications-content.ts notifications-examples.ts',
    ui: 'notification-filters.tsx notification-item.tsx notification-list.tsx notifications-inbox.tsx notifications-panel.tsx notifications-state.tsx notifications-trigger.tsx',
    view: 'notifications-view.tsx notifications.test.tsx',
    '.': 'notifications.types.ts',
  },
  onboarding: {
    contents: 'onboarding.constants.ts',
    forms: 'onboarding.schema.ts',
    'educator/forms': 'educator-details-step.tsx',
    'entity-select/forms': 'entity-select-step.tsx',
    'entity-select/ui': 'entity-card.tsx',
    'others/forms': 'others-details-step.tsx',
    'profile-basics/forms': 'profile-basics-step.tsx',
    'review/forms': 'review-step.tsx',
    'student/forms': 'student-details-step.tsx',
    'shared/ui': 'choice-checkbox-group.tsx field-error.tsx onboarding-layout.tsx onboarding-stepper.tsx optional-badge.tsx step-actions.tsx tag-input.tsx',
    'completed/view': 'onboarding-completed.tsx',
    view: 'onboarding-view.tsx onboarding-view.test.tsx',
    '.': 'onboarding.types.ts',
  },
  'personal-workspace': {
    'classwork/contents': 'sample-classwork.ts',
    'classwork/ui': 'classwork-card.tsx',
    'classwork/view': 'classwork-view.tsx',
    'notes/contents': 'note-card-actions.ts notes/contents/note-records.ts notes-content.ts',
    'notes/forms': 'note-editor-dialog.tsx',
    'notes/ui': 'note-card-menu.tsx note-card.tsx note-delete-dialog.tsx note-label-chips.tsx note-labels.tsx note-list.tsx',
    'notes/utils': 'handle-add-item.ts notes/utils/note-records.ts toggle-item.ts',
    'notes/view': 'notes-view.tsx notes-view.test.tsx',
    'student-overview/contents': 'student-overview-content.ts student-overview-copy.ts',
    'student-overview/utils': 'time-greeting.ts',
    'student-overview/ui': 'classwork-highlight.tsx overview-tip-banner.tsx personal-metrics.tsx progress-summary.tsx quick-links.tsx study-consistency.tsx subjects-table.tsx upcoming-items.tsx',
    'student-overview/view': 'student-overview-view.tsx',
    'study-spaces/forms': 'create-space-dialog.tsx join-space-dialog.tsx',
    'study-spaces/ui': 'city-buildings.tsx city-plaza.tsx city-traffic.tsx room-plan-preview.tsx space-card-grid.tsx space-map-art.tsx space-map.tsx space-map.test.tsx study-hall-world.tsx',
    'study-spaces/utils': 'city-layout.ts city-layout.test.ts space-format.ts space-map-layout.ts space-roster.ts traffic-paths.ts traffic-paths.test.ts',
    'study-spaces/hooks': 'use-walk-keys.ts',
    'study-spaces/model': 'study-spaces-records.ts',
    'study-spaces/view': 'study-spaces-view.tsx study-spaces-flow.test.tsx',
    'study-spaces/detail/forms': 'character-dialog.tsx',
    'study-spaces/detail/ui': 'character-figure.tsx drawer-panel.tsx focus-music-panel.tsx locker-panel.tsx nap-banner.tsx pomodoro-chip.tsx room-chat-panel.tsx room-extras.tsx room-garden.tsx room-zones.tsx seat-panel.tsx space-room-scene.tsx task-board-panel.tsx tv-panel.tsx',
    'study-spaces/detail/model': 'drawer-storage.ts room-ambience.ts room-lockers.ts room-tasks.ts room-tv.ts study-space-seats.ts',
    'study-spaces/detail/audio': 'focus-music.ts',
    'study-spaces/detail/hooks': 'use-focus-music.ts use-pomodoro.ts',
    'study-spaces/detail/view': 'study-space-detail-view.tsx study-space-detail.test.tsx study-space-room-features.test.ts',
    'subjects/contents': 'subject-appearance.ts',
    'subjects/forms': 'subject-composer-dialog.tsx subject-delete-dialog.tsx subject-milestone-delete-dialog.tsx subject-milestone-dialog.tsx',
    'subjects/ui': 'continue-learning.tsx sample-data-notice.tsx subject-action-button.tsx subject-card.tsx subject-congrats-dialog.tsx subject-list-row.tsx subject-milestones-card.tsx subject-study-content.tsx subjects-hero.tsx',
    'subjects/model': 'subject-records.ts',
    'subjects/view': 'subject-detail-view.tsx subjects-view.tsx subjects-view.test.tsx',
    'tasks/forms': 'task-composer-dialog.tsx task-delete-dialog.tsx',
    'tasks/ui': 'task-board.tsx task-detail-dialog.tsx task-list.tsx task-subject-groups.tsx',
    'tasks/model': 'task-records.ts',
    'tasks/view': 'tasks-view.tsx tasks-view.test.tsx',
  },
  progress: {
    ui: 'classroom-results-section.tsx personal-progress-section.tsx',
    view: 'student-progress-view.tsx student-progress-view.test.tsx',
  },
  schedule: {
    contents: 'schedule-colors.ts schedule-content.ts',
    utils: 'calendar-dates.ts calendar-dates.test.ts',
    ui: 'calendar-month.tsx calendar-timeline.tsx schedule-day-agenda.tsx schedule-summary.tsx',
    view: 'role-schedule-view.tsx schedule-workspace-view.tsx schedule-workspace-view.test.tsx',
    '.': 'schedule-types.ts',
  },
  'teaching-activities': {
    forms: 'activity-composer.tsx',
    ui: 'activity-collection.tsx activity-details.tsx',
    model: 'activity-workspace-model.ts',
    view: 'teaching-activities-view.tsx teaching-activities.test.tsx',
  },
  'tutor-workspace': {
    ui: 'tutor-workspace-ui.tsx',
    view: 'tutor-workspace.test.tsx',
    'activities/view': 'tutor-activities-view.tsx',
    'ai/view': 'tutor-ai-assistant-view.tsx',
    'attendance/view': 'tutor-attendance-view.tsx',
    'communication/view': 'tutor-announcements-view.tsx tutor-discussions-view.tsx',
    'learners/view': 'tutor-learner-detail-view.tsx tutor-learners-view.tsx',
    'learning-plans/view': 'learning-plans-view.tsx',
    'materials/view': 'tutor-materials-view.tsx',
    'notes/view': 'tutor-session-notes-view.tsx',
    'notifications/view': 'tutor-notifications-view.tsx',
    'overview/contents': 'tutor-overview-content.ts',
    'overview/view': 'tutor-overview-view.tsx',
    'progress/view': 'tutor-student-progress-view.tsx',
    'sessions/view': 'tutor-sessions-view.tsx',
    'settings/view': 'tutor-settings-view.tsx',
  },
}

const docsRoot = dirname(fileURLToPath(import.meta.url))
const featureDocsRoot = join(docsRoot, 'components/features')
const sourceRoot = resolve(docsRoot, '../src/components/features')
const mode = process.argv[2]

if (!['--write', '--check'].includes(mode) || process.argv.length !== 3) {
  console.error('Usage: node docs/generate-feature-source-snapshots.mjs --write|--check')
  process.exit(1)
}

const posix = path => path.replaceAll('\\', '/')
const isFeatureCode = path => /\.(?:tsx?|jsx?|css)$/.test(path)

async function walk(dir) {
  const result = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) result.push(...await walk(path))
    else if (entry.isFile()) result.push(path)
  }
  return result
}

async function walkDirectories(dir) {
  const result = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const path = join(dir, entry.name)
    result.push(path, ...await walkDirectories(path))
  }
  return result
}

async function readIfPresent(path) {
  try {
    return await readFile(path)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function prepare(feature, groups) {
  const srcDir = join(sourceRoot, feature)
  const docDir = join(featureDocsRoot, feature)
  const files = (await walk(srcDir))
    .filter(isFeatureCode)
    .map(path => posix(relative(srcDir, path)))
  const chosen = new Set()
  const snapshots = new Map()
  const lines = [
    `# ${feature} source reference`,
    '',
    'Exact copies of current `src/components/features/` source files, arranged by the proposed folder map in this feature README. The `.txt` suffix prevents these **non-runnable reference copies** (including tests) from being picked up by app tooling. Imports in the copies still point at the original source layout; do not compile them in place. Recheck the source before using a snapshot for a manual refactor.',
    '',
  ]

  for (const [folder, names] of Object.entries(groups)) {
    lines.push(`## ${folder === '.' ? 'Domain root' : `\`${folder}/\``}`, '')
    for (const name of names.split(/\s+/)) {
      const matches = files.filter(file => name.includes('/') ? file === name : basename(file) === name)
      if (matches.length !== 1) throw new Error(`${feature}: expected one current source for ${name}, found ${matches.length}`)
      const source = matches[0]
      if (chosen.has(source)) throw new Error(`${feature}: mapped twice: ${source}`)
      chosen.add(source)
      const target = posix(join('source', folder, `${basename(source)}.txt`))
      if (snapshots.has(target)) throw new Error(`${feature}: destination collision: ${target}`)
      snapshots.set(target, await readFile(join(srcDir, source)))
      lines.push(`- [\`${target}\`](${target}) <- \`src/components/features/${feature}/${source}\``)
    }
    lines.push('')
  }
  const missing = files.filter(file => !chosen.has(file))
  if (missing.length) throw new Error(`${feature}: unmapped source:\n${missing.join('\n')}`)
  return { feature, docDir, snapshots, index: Buffer.from(lines.join('\n')) }
}

async function main() {
  const active = []
  for (const dir of await readdir(sourceRoot, { withFileTypes: true })) {
    if (dir.isDirectory() && (await walk(join(sourceRoot, dir.name))).some(isFeatureCode)) active.push(dir.name)
  }
  const unplanned = active.filter(feature => !(feature in allocations))
  if (unplanned.length) throw new Error(`Features without snapshot plans: ${unplanned.join(', ')}`)

  // Validate the whole mapping and any existing snapshots before writing a new file.
  const plans = await Promise.all(Object.entries(allocations).map(([feature, groups]) => prepare(feature, groups)))
  const pending = []
  let mirrored = 0
  for (const sourceDir of await walkDirectories(sourceRoot)) {
    const path = posix(relative(sourceRoot, sourceDir))
    const [feature, ...subfolders] = path.split('/')
    const docDir = join(featureDocsRoot, path)
    const readme = join(docDir, 'README.md')
    const existing = await readIfPresent(readme)
    if (existing !== null) {
      mirrored++
      continue
    }
    if (mode === '--check') throw new Error(`Missing mirrored guide: ${path}`)
    if (!subfolders.length) throw new Error(`Missing feature guide: ${path}`)
    const owner = join(featureDocsRoot, feature)
    const guideLink = posix(relative(docDir, join(owner, 'README.md')))
    const sourceLink = posix(relative(docDir, join(owner, 'SOURCE_INDEX.md')))
    const text = `# ${subfolders.at(-1)}\n\nThis directory mirrors \`src/components/features/${path}/\`. For the current files, proposed component folders, and manual migration checks, use the [${feature} guide](${guideLink}) and its [source index](${sourceLink}). These copies are documentation only; application code has not moved.\n`
    pending.push([readme, Buffer.from(text)])
    mirrored++
  }
  for (const { feature, docDir, snapshots, index } of plans) {
    if (!(await readIfPresent(join(docDir, 'README.md')))) throw new Error(`Missing guide for ${feature}`)
    const paths = [...snapshots.keys()]
    const sourceDir = join(docDir, 'source')
    const existing = await walk(sourceDir).catch(error => error.code === 'ENOENT' ? [] : Promise.reject(error))
    const extra = existing.map(path => posix(relative(docDir, path))).filter(path => !snapshots.has(path))
    if (extra.length) throw new Error(`${feature}: unexpected snapshot files:\n${extra.join('\n')}`)
    for (const path of paths) {
      const current = await readIfPresent(join(docDir, path))
      if (current === null && mode === '--write') pending.push([join(docDir, path), snapshots.get(path)])
      else if (current === null || !current.equals(snapshots.get(path))) {
        throw new Error(`${feature}: snapshot is missing or stale: ${path}`)
      }
    }
    const indexPath = join(docDir, 'SOURCE_INDEX.md')
    const currentIndex = await readIfPresent(indexPath)
    if (currentIndex === null && mode === '--write') pending.push([indexPath, index])
    else if (currentIndex === null || !currentIndex.equals(index)) {
      const firstDifference = currentIndex?.findIndex((byte, offset) => byte !== index[offset])
      throw new Error(`${feature}: source index is missing or stale (expected ${index.length} bytes, found ${currentIndex?.length ?? 0}; first difference ${firstDifference})`)
    }
  }

  for (const [path, bytes] of pending) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, bytes, { flag: 'wx' })
  }
  console.log(`${mode === '--check' ? 'Verified' : 'Created'} ${plans.reduce((sum, plan) => sum + plan.snapshots.size, 0)} source snapshots across ${plans.length} features and ${mirrored} matching guide folders.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
