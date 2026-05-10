// Устанавливает скачанную статическую копию старого сайта в public/old-site/
// и патчит абсолютные пути ассетов на относительные, чтобы сайт работал
// под URL http://localhost:5173/old-site/ (или /old-site/ в продакшне).
//
// Источник: _snapshots/old-site-netlify/
// Назначение: public/old-site/

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')
const SRC = path.resolve(ROOT, '_snapshots/old-site-netlify')
const DST = path.resolve(ROOT, 'public/old-site')

if (!fs.existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`)
  console.error('Run: node scripts/fetch-old-site.mjs <netlify-url>  first.')
  process.exit(1)
}

if (fs.existsSync(DST)) {
  console.log(`Removing existing ${DST}`)
  fs.rmSync(DST, { recursive: true, force: true })
}
fs.mkdirSync(DST, { recursive: true })

const TEXT_EXT = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.map'])

function copyAndPatch(src, dst) {
  const ext = path.extname(src).toLowerCase()
  if (TEXT_EXT.has(ext)) {
    let text = fs.readFileSync(src, 'utf8')
    text = text.replace(/(["'`(=,\s])\/assets\//g, '$1./assets/')
    text = text.replace(/(["'`(=,\s])\/favicon\.svg/g, '$1./favicon.svg')
    if (ext === '.html' || ext === '.htm') {
      text = text.replace(/<head([^>]*)>/i, '<head$1>\n    <base href="./" />')
    }
    fs.writeFileSync(dst, text, 'utf8')
  } else {
    fs.copyFileSync(src, dst)
  }
}

let count = 0
function walk(srcDir, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const name = entry.name
    if (name.startsWith('beautified') || name === 'strings.txt' || name === 'jsx-calls.txt') continue
    const s = path.join(srcDir, name)
    const d = path.join(dstDir, name)
    if (entry.isDirectory()) walk(s, d)
    else if (entry.isFile()) {
      copyAndPatch(s, d)
      count += 1
    }
  }
}

walk(SRC, DST)

console.log(`Installed ${count} files to ${DST}`)
console.log()
console.log('Открой в браузере (после `npm run dev`):')
console.log('  http://localhost:5173/old-site/')
console.log()
console.log('В продакшне (после `npm run build`) старый сайт также будет')
console.log('доступен по тому же относительному пути.')
