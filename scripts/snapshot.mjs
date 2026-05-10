// Снимает копию текущего состояния проекта в указанную папку.
// Игнорирует node_modules, dist, _snapshots, .git и крупные временные данные.
//
// Использование:
//   node scripts/snapshot.mjs <destination-folder>
//
// Пример:
//   node scripts/snapshot.mjs _snapshots/redesign-2026-05-09

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

const IGNORE_NESTED = new Set([
  'node_modules',
  '.cache',
])

const dest = process.argv[2]
if (!dest) {
  console.error('Usage: node scripts/snapshot.mjs <destination-folder>')
  process.exit(1)
}

const destAbs = path.resolve(ROOT, dest)
if (destAbs.startsWith(ROOT) === false) {
  console.error('Destination must be inside project root')
  process.exit(1)
}

let copied = 0
let bytes = 0

function copyDir(srcDir, dstDir, depth = 0) {
  fs.mkdirSync(dstDir, { recursive: true })
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const name = entry.name
    if (depth === 0 && IGNORE_TOP.has(name)) continue
    if (depth > 0 && IGNORE_NESTED.has(name)) continue
    const src = path.join(srcDir, name)
    const dst = path.join(dstDir, name)
    if (entry.isDirectory()) {
      copyDir(src, dst, depth + 1)
    } else if (entry.isFile()) {
      fs.copyFileSync(src, dst)
      const stat = fs.statSync(dst)
      copied += 1
      bytes += stat.size
    }
  }
}

const start = Date.now()
copyDir(ROOT, destAbs)
const ms = Date.now() - start

const sizeMb = (bytes / (1024 * 1024)).toFixed(2)
console.log(`Snapshot ready: ${destAbs}`)
console.log(`Files: ${copied}`)
console.log(`Total size: ${sizeMb} MB`)
console.log(`Time: ${ms} ms`)
