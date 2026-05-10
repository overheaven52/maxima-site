// Восстанавливает состояние проекта из snapshot-папки в корень.
// Перед перезаписью автоматически складывает текущие исходники в _snapshots/_pre-restore/<timestamp>/
// чтобы откат не был необратимым.
//
// Использование:
//   node scripts/restore.mjs <snapshot-folder>
//
// Примеры:
//   node scripts/restore.mjs redesign-2026-05-09
//   node scripts/restore.mjs dark-2026-05-09
//
// Папки ищутся внутри _snapshots/. Можно дать абсолютный или относительный путь.

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')

const IGNORE_TOP = new Set([
  'node_modules',
  'dist',
  '_snapshots',
  '.git',
  '.cache',
])

const IGNORE_NESTED = new Set(['node_modules', '.cache'])

function listFiles(dir, depth = 0, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name
    if (depth === 0 && IGNORE_TOP.has(name)) continue
    if (depth > 0 && IGNORE_NESTED.has(name)) continue
    const full = path.join(dir, name)
    if (entry.isDirectory()) {
      listFiles(full, depth + 1, out)
    } else if (entry.isFile()) {
      out.push(full)
    }
  }
  return out
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function copyFileSafe(src, dst) {
  ensureDir(path.dirname(dst))
  fs.copyFileSync(src, dst)
}

function resolveSnapshot(arg) {
  if (!arg) return null
  if (path.isAbsolute(arg) && fs.existsSync(arg)) return arg
  const inSnapshots = path.resolve(ROOT, '_snapshots', arg)
  if (fs.existsSync(inSnapshots)) return inSnapshots
  const direct = path.resolve(ROOT, arg)
  if (fs.existsSync(direct)) return direct
  return null
}

const snapArg = process.argv[2]
const snapshot = resolveSnapshot(snapArg)
if (!snapshot) {
  console.error('Snapshot folder not found.')
  console.error('Available snapshots in _snapshots/:')
  const snapsDir = path.resolve(ROOT, '_snapshots')
  if (fs.existsSync(snapsDir)) {
    for (const e of fs.readdirSync(snapsDir, { withFileTypes: true })) {
      if (e.isDirectory() && !e.name.startsWith('_')) {
        console.error(`  - ${e.name}`)
      }
    }
  }
  process.exit(1)
}

console.log(`Restoring from: ${snapshot}`)

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, '-')
  .replace('T', '_')
  .slice(0, 19)
const backupDir = path.resolve(ROOT, '_snapshots', '_pre-restore', stamp)
console.log(`Backing up current state to: ${backupDir}`)
ensureDir(backupDir)

const currentFiles = listFiles(ROOT)
for (const src of currentFiles) {
  const rel = path.relative(ROOT, src)
  copyFileSafe(src, path.join(backupDir, rel))
}
console.log(`  ${currentFiles.length} files backed up`)

console.log('Removing current source files (excluding ignored)...')
let removed = 0
for (const src of currentFiles) {
  fs.rmSync(src, { force: true })
  removed += 1
}

const snapFiles = listFiles(snapshot)
console.log(`Copying ${snapFiles.length} files from snapshot...`)
for (const src of snapFiles) {
  const rel = path.relative(snapshot, src)
  copyFileSafe(src, path.join(ROOT, rel))
}

console.log()
console.log(`Done. Restored ${snapFiles.length} files.`)
console.log(`Previous state saved at: _snapshots/_pre-restore/${stamp}/`)
console.log()
console.log('Next steps:')
console.log('  1. (If dependencies changed) npm install')
console.log('  2. npm run dev   (or npm run build)')
