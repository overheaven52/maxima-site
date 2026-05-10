// Скачивает статическую сборку старого сайта с Netlify в _snapshots/old-site-netlify/
//
// 1. Качает index.html
// 2. Парсит ссылки на JS/CSS/картинки/иконки
// 3. Качает все найденные ассеты
// 4. Сохраняет всё с сохранением исходных путей
//
// Использование:
//   node scripts/fetch-old-site.mjs <base-url>
//
// Пример:
//   node scripts/fetch-old-site.mjs https://zesty-pegasus-0dc816.netlify.app/

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..')

const baseArg = process.argv[2]
if (!baseArg) {
  console.error('Usage: node scripts/fetch-old-site.mjs <base-url>')
  process.exit(1)
}

const baseUrl = baseArg.endsWith('/') ? baseArg : baseArg + '/'
const outDir = path.resolve(ROOT, '_snapshots', 'old-site-netlify')
fs.mkdirSync(outDir, { recursive: true })

const seen = new Set()
const queued = []

function enqueue(u) {
  try {
    const abs = new URL(u, baseUrl).toString()
    const sameOrigin = abs.startsWith(baseUrl)
    if (!sameOrigin) return
    if (seen.has(abs)) return
    seen.add(abs)
    queued.push(abs)
  } catch {
    /* ignore */
  }
}

function urlToLocalPath(absUrl) {
  const u = new URL(absUrl)
  let p = u.pathname
  if (p === '/' || p === '') p = '/index.html'
  if (p.endsWith('/')) p = p + 'index.html'
  return path.join(outDir, p)
}

async function downloadOne(absUrl) {
  const localPath = urlToLocalPath(absUrl)
  fs.mkdirSync(path.dirname(localPath), { recursive: true })
  const res = await fetch(absUrl)
  if (!res.ok) {
    console.warn(`  ! ${res.status} ${absUrl}`)
    return null
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.startsWith('text/') || ct.includes('json') || ct.includes('javascript') || ct.includes('css') || ct.includes('svg')) {
    const text = await res.text()
    fs.writeFileSync(localPath, text, 'utf8')
    console.log(`  ${localPath.replace(outDir, '')}  (${text.length} chars)`)
    return { kind: 'text', text, localPath }
  }
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(localPath, buf)
  console.log(`  ${localPath.replace(outDir, '')}  (${buf.length} bytes)`)
  return { kind: 'binary', localPath }
}

function findLinksInHtml(html) {
  const out = []
  const patterns = [
    /<link\s+[^>]*href=["']([^"']+)["']/gi,
    /<script\s+[^>]*src=["']([^"']+)["']/gi,
    /<img\s+[^>]*src=["']([^"']+)["']/gi,
    /<source\s+[^>]*src=["']([^"']+)["']/gi,
    /<meta\s+[^>]*content=["']([^"']+\.(?:png|jpg|jpeg|webp|svg|ico))["']/gi,
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(html))) out.push(m[1])
  }
  return out
}

function findLinksInCssOrJs(text) {
  const out = []
  const re = /["'`]([./][^"'`\s)]*\.(?:png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf|eot|mp4|webm|css|js))["'`]/gi
  let m
  while ((m = re.exec(text))) out.push(m[1])
  const re2 = /url\(\s*["']?([^"')\s]+\.(?:png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf|eot))["']?\s*\)/gi
  while ((m = re2.exec(text))) out.push(m[1])
  const re3 = /["']\/(assets\/[^"']+)["']/gi
  while ((m = re3.exec(text))) out.push('/' + m[1])
  return out
}

async function main() {
  console.log(`Fetching: ${baseUrl}`)
  console.log(`Output:   ${outDir}`)
  console.log()

  enqueue(baseUrl)

  while (queued.length > 0) {
    const next = queued.shift()
    let result
    try {
      result = await downloadOne(next)
    } catch (e) {
      console.warn(`  ! ${next} :: ${e.message}`)
      continue
    }
    if (!result || result.kind !== 'text') continue
    const text = result.text
    const localPath = result.localPath
    let candidates = []
    if (localPath.endsWith('.html')) {
      candidates = findLinksInHtml(text)
    } else if (localPath.endsWith('.css') || localPath.endsWith('.js') || localPath.endsWith('.mjs')) {
      candidates = findLinksInCssOrJs(text)
    }
    for (const c of candidates) {
      if (c.startsWith('data:') || c.startsWith('mailto:') || c.startsWith('tel:')) continue
      enqueue(c)
    }
    if (localPath.endsWith('.js') || localPath.endsWith('.mjs')) {
      const sourceMapMatch = text.match(/\/\/# sourceMappingURL=([^\s]+)/)
      if (sourceMapMatch) enqueue(sourceMapMatch[1])
    }
    if (localPath.endsWith('.css')) {
      const sourceMapMatch = text.match(/\/\*# sourceMappingURL=([^\s*]+) \*\//)
      if (sourceMapMatch) enqueue(sourceMapMatch[1])
    }
  }

  console.log()
  console.log(`Downloaded ${seen.size} files.`)
  console.log(`Saved to: ${outDir}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
