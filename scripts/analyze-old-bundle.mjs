// Грубо «расширяет» minified JS bundle и извлекает все строковые литералы,
// чтобы можно было найти разметку, тексты и Tailwind-классы старого сайта.
//
// Создаёт:
//   _snapshots/old-site-netlify/assets/beautified.js  — JS с переносами строк
//   _snapshots/old-site-netlify/strings.txt           — все строковые литералы по одной на строку
//   _snapshots/old-site-netlify/jsx-calls.txt         — фрагменты с jsx(...)/ jsxs(...) вызовами

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const SRC = path.resolve(ROOT, '_snapshots/old-site-netlify/assets/index-ClzpG33w.js')
const OUT_DIR = path.resolve(ROOT, '_snapshots/old-site-netlify')
const BEAUTIFIED = path.join(OUT_DIR, 'assets/beautified.js')
const STRINGS = path.join(OUT_DIR, 'strings.txt')
const JSX_CALLS = path.join(OUT_DIR, 'jsx-calls.txt')

const js = fs.readFileSync(SRC, 'utf8')

function beautifyRough(s) {
  let out = ''
  let depth = 0
  let inString = null
  let prev = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inString) {
      if (c === '\\') { out += c + s[++i]; continue }
      if (c === inString) { inString = null }
      out += c
    } else if (c === '"' || c === "'" || c === '`') {
      inString = c
      out += c
    } else if (c === '{') {
      depth += 1
      out += c + '\n' + '  '.repeat(depth)
    } else if (c === '}') {
      depth = Math.max(0, depth - 1)
      out += '\n' + '  '.repeat(depth) + c
    } else if (c === ';') {
      out += c + '\n' + '  '.repeat(depth)
    } else if (c === ',' && depth > 0 && (prev !== '\\')) {
      out += c + ' '
    } else {
      out += c
    }
    prev = c
  }
  return out
}

console.log('Beautifying...')
const beautified = beautifyRough(js)
fs.writeFileSync(BEAUTIFIED, beautified, 'utf8')
console.log(`  ${BEAUTIFIED}  (${beautified.length} chars)`)

console.log('Extracting strings...')
const strings = []
const reStr = /(["'`])((?:[^\\]|\\.)*?)\1/g
let m
while ((m = reStr.exec(js))) {
  const v = m[2]
  if (v.length === 0) continue
  if (v.length > 500) continue
  strings.push(v)
}
fs.writeFileSync(STRINGS, strings.join('\n'), 'utf8')
console.log(`  ${STRINGS}  (${strings.length} strings)`)

console.log('Extracting jsx-call snippets...')
const lines = beautified.split('\n')
const jsxLines = []
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (/jsxs?\s*\(/.test(line)) {
    jsxLines.push(`L${i + 1}: ${line}`)
  }
}
fs.writeFileSync(JSX_CALLS, jsxLines.join('\n'), 'utf8')
console.log(`  ${JSX_CALLS}  (${jsxLines.length} jsx lines)`)

console.log()
console.log('Russian strings (sample):')
const ru = strings.filter((s) => /[\u0400-\u04FF]/.test(s)).filter((s) => s.length > 1)
const unique = [...new Set(ru)]
console.log(`  total unique: ${unique.length}`)
for (const s of unique.slice(0, 60)) {
  console.log(`  - ${s.slice(0, 120)}`)
}
