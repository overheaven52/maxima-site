// Извлекает русские строки из beautified.js (читаемая копия Netlify-bundle)
// и сохраняет уникальные строки в _snapshots/old-site-netlify/strings-ru.txt.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const src = path.join(root, '_snapshots/old-site-netlify/assets/beautified.js')
const out = path.join(root, '_snapshots/old-site-netlify/strings-ru.txt')

// Сначала развернём все \uXXXX в реальные символы — тогда russкий текст станет
// видимым кириллическим, и regex будет ловить его в строковых литералах.
const decodeUnicodeEscapes = (text) =>
  text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  )

const js = decodeUnicodeEscapes(fs.readFileSync(src, 'utf8'))

const stringLiteral = /(?<!\\)(["'`])((?:\\.|(?!\1).)*?)\1/g
const ruRe = /[А-Яа-яЁё]/

const seen = new Set()
const ordered = []

let m
while ((m = stringLiteral.exec(js)) !== null) {
  const raw = m[2]
  if (!ruRe.test(raw)) continue
  const cleaned = raw
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    .trim()
  if (!cleaned) continue
  if (seen.has(cleaned)) continue
  seen.add(cleaned)
  ordered.push(cleaned)
}

fs.writeFileSync(out, ordered.join('\n---\n'), 'utf8')
console.log(`Extracted ${ordered.length} unique russian strings → ${path.relative(root, out)}`)
