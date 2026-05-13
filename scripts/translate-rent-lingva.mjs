/**
 * Переводит rent из src/i18n/kk.json (kk) → ru (Google gtx), пишет server/rent-ru-translated.json
 * и подставляет rent в server/defaultContent.json. Запуск: node scripts/translate-rent-lingva.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const cache = new Map()

function shouldSkipString(t) {
  const s = String(t)
  if (!s.trim()) return true
  if (/^\/[a-zA-Z0-9_./-]+$/.test(s)) return true
  if (/^https?:\/\//i.test(s)) return true
  if (/^m-[a-z0-9-]+$/i.test(s) || /^cat-[a-z0-9-]+$/i.test(s) || /^price-[a-z0-9-]+$/i.test(s))
    return true
  if (!/[әіңғүұқөһӘ]/u.test(s) && !/[а-яА-ЯЁё]{3,}/.test(s)) return true
  return false
}

function parseGtxJson(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (!Array.isArray(data?.[0])) return null
  let out = ''
  for (const block of data[0]) {
    if (block && typeof block[0] === 'string') out += block[0]
  }
  return out || null
}

async function gtxTranslate(text) {
  const enc = encodeURIComponent(text)
  if (enc.length > 3200) {
    const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean)
    if (parts.length < 2) {
      const half = Math.ceil(text.length / 2)
      return (await gtxTranslate(text.slice(0, half))) + (await gtxTranslate(text.slice(half)))
    }
    let acc = ''
    for (const p of parts) {
      acc += (acc ? ' ' : '') + (await gtxTranslate(p))
      await sleep(80)
    }
    return acc
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=kk&tl=ru&dt=t&q=${enc}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`gtx ${res.status}: ${text.slice(0, 50)}…`)
  const raw = await res.text()
  const out = parseGtxJson(raw)
  if (!out) throw new Error(`gtx parse fail: ${text.slice(0, 40)}…`)
  await sleep(100)
  return out
}

async function translateChunk(text) {
  const t = String(text)
  if (!t.trim()) return t
  if (shouldSkipString(t)) {
    cache.set(t, t)
    return t
  }
  if (cache.has(t)) return cache.get(t)
  const out = await gtxTranslate(t)
  cache.set(t, out)
  return out
}

async function mapStrings(value) {
  if (typeof value === 'string') return translateChunk(value)
  if (Array.isArray(value)) {
    const out = []
    for (const item of value) out.push(await mapStrings(item))
    return out
  }
  if (value && typeof value === 'object') {
    const out = {}
    for (const k of Object.keys(value)) {
      out[k] = await mapStrings(value[k])
    }
    return out
  }
  return value
}

async function main() {
  const kkPath = path.join(root, 'src', 'i18n', 'kk.json')
  const kkRent = JSON.parse(fs.readFileSync(kkPath, 'utf8')).rent
  if (!kkRent || typeof kkRent !== 'object') {
    throw new Error('kk.json has no rent block')
  }
  console.log('Translating rent kk→ru (Google gtx), ~1–3 min…')
  const ruRent = await mapStrings(kkRent)
  const outPath = path.join(root, 'server', 'rent-ru-translated.json')
  fs.writeFileSync(outPath, JSON.stringify(ruRent, null, 2) + '\n', 'utf8')
  console.log('Wrote', outPath)

  const dcPath = path.join(root, 'server', 'defaultContent.json')
  const dc = JSON.parse(fs.readFileSync(dcPath, 'utf8'))
  dc.rent = ruRent
  fs.writeFileSync(dcPath, JSON.stringify(dc, null, 2) + '\n', 'utf8')
  console.log('Updated defaultContent.json rent → Russian')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
