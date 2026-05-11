import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const PORT = Number(process.env.PORT || 3001)
const HOST = process.env.HOST || '0.0.0.0'
const IS_PROD = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'maxima2026'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

if (!process.env.JWT_SECRET) {
  console.warn(
    '[server] JWT_SECRET не задан в .env — сгенерирован случайный (после рестарта токены будут сброшены)',
  )
}
if (!process.env.ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) {
  console.warn(
    '[server] ADMIN_PASSWORD не задан — используется значение по умолчанию "maxima2026". Поменяйте его в .env!',
  )
}

const DATA_DIR = path.join(__dirname, 'data')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')
const DEFAULT_CONTENT_FILE = path.join(__dirname, 'defaultContent.json')

fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

if (!fs.existsSync(CONTENT_FILE)) {
  if (fs.existsSync(DEFAULT_CONTENT_FILE)) {
    fs.copyFileSync(DEFAULT_CONTENT_FILE, CONTENT_FILE)
    console.log('[server] content.json создан из defaultContent.json')
  } else {
    fs.writeFileSync(CONTENT_FILE, '{}', 'utf8')
  }
}

// Глубокий мердж: добавляет в existing отсутствующие ключи из defaults,
// не затирая уже существующие значения. Возвращает [merged, changed].
function deepMergeMissing(existing, defaults) {
  let changed = false
  if (
    !defaults ||
    typeof defaults !== 'object' ||
    Array.isArray(defaults)
  ) {
    return [existing, false]
  }
  if (
    !existing ||
    typeof existing !== 'object' ||
    Array.isArray(existing)
  ) {
    // если у пользователя на этом уровне нет объекта, копируем дефолтный
    return [JSON.parse(JSON.stringify(defaults)), true]
  }
  const out = { ...existing }
  for (const key of Object.keys(defaults)) {
    if (!(key in out)) {
      out[key] = JSON.parse(JSON.stringify(defaults[key]))
      changed = true
    } else if (
      defaults[key] &&
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key])
    ) {
      const [merged, ch] = deepMergeMissing(out[key], defaults[key])
      out[key] = merged
      if (ch) changed = true
    }
  }
  return [out, changed]
}

// При старте — подмерживаем недостающие секции дефолтов в content.json,
// чтобы новые блоки (about/technology/equipment/geography/faq) появились
// автоматически после обновления шаблона, без сброса уже введённых данных.
// Дополнительно — добавляем в страницы недостающие блоки из дефолтных страниц.
function mergeHomePageBlocks(existing, defaults) {
  // Пропуск только для промежуточной мульти-страничной схемы (v2), уже не используется
  if (existing?._layoutVersion === 2) return [existing, false]
  if (!existing || !Array.isArray(existing.pages)) return [existing, false]
  if (!defaults || !Array.isArray(defaults.pages)) return [existing, false]
  let changed = false
  const pagesOut = existing.pages.map((page) => {
    const def = defaults.pages.find((p) => (p.slug || '/') === (page.slug || '/'))
    if (!def || !Array.isArray(def.blocks)) return page
    const haveTypes = new Set((page.blocks || []).map((b) => b.type))
    const additions = def.blocks.filter((b) => !haveTypes.has(b.type))
    if (additions.length === 0) return page
    changed = true
    return { ...page, blocks: [...(page.blocks || []), ...additions] }
  })
  return [{ ...existing, pages: pagesOut }, changed]
}

function mergePageSeoMissing(existing, defaults) {
  if (!existing || !Array.isArray(existing.pages)) return [existing, false]
  if (!defaults || !Array.isArray(defaults.pages)) return [existing, false]
  let changed = false
  const pagesOut = existing.pages.map((page) => {
    const def = defaults.pages.find((p) => (p.slug || '/') === (page.slug || '/'))
    if (!def?.seo || typeof def.seo !== 'object') return page
    const [mergedSeo, ch] = deepMergeMissing(page.seo || {}, def.seo)
    if (!ch) return page
    changed = true
    return { ...page, seo: mergedSeo }
  })
  return [{ ...existing, pages: pagesOut }, changed]
}

function mergeRentCategories(existing, defaults) {
  if (!existing || typeof existing !== 'object') return [existing, false]
  const exRent = existing.rent
  const defRent = defaults?.rent
  if (!exRent || !defRent || !Array.isArray(defRent.categories)) return [existing, false]
  const [rentMerged, rentKeysChanged] = deepMergeMissing(exRent, {
    categoriesEyebrow: defRent.categoriesEyebrow,
    categoryBadge: defRent.categoryBadge,
    heading: defRent.heading,
    description: defRent.description,
  })
  let changed = rentKeysChanged
  const defById = new Map(defRent.categories.map((c) => [c.id, c]))
  let categories = [...(rentMerged.categories || [])]
  const have = new Set(categories.map((c) => c.id))
  for (const c of defRent.categories) {
    if (c?.id && !have.has(c.id)) {
      categories.push(JSON.parse(JSON.stringify(c)))
      have.add(c.id)
      changed = true
    }
  }
  categories = categories.map((c) => {
    const d = defById.get(c.id)
    if (!d) return c
    let cat = { ...c }
    if (!String(cat.imageUrl || '').trim() && d.imageUrl) {
      cat.imageUrl = d.imageUrl
      changed = true
    }
    const dmById = new Map((d.machines || []).map((m) => [m.id, m]))
    cat.machines = (cat.machines || []).map((m) => {
      const dm = dmById.get(m.id)
      if (!dm || String(m.imageUrl || '').trim() || !dm.imageUrl) return m
      changed = true
      return { ...m, imageUrl: dm.imageUrl }
    })
    return cat
  })
  if (!changed) return [existing, false]
  return [{ ...existing, rent: { ...rentMerged, categories } }, true]
}

function mergeEquipmentModelImages(existing, defaults) {
  const ex = existing?.equipment?.models
  const defs = defaults?.equipment?.models
  if (!Array.isArray(ex) || !Array.isArray(defs)) return [existing, false]
  const dm = new Map(defs.map((m) => [m.id, m]))
  let changed = false
  const models = ex.map((m) => {
    const d = dm.get(m.id)
    if (!d || String(m.imageUrl || '').trim() || !d.imageUrl) return m
    changed = true
    return { ...m, imageUrl: d.imageUrl }
  })
  if (!changed) return [existing, false]
  return [{ ...existing, equipment: { ...existing.equipment, models } }, true]
}

function mergeHeaderRentNavLink(existing, defaults) {
  const h = existing.header
  const defLinks = defaults?.header?.navLinks
  if (!h || !Array.isArray(h.navLinks) || !Array.isArray(defLinks)) return [existing, false]
  const hasRent = h.navLinks.some(
    (l) =>
      l.id === 'rent' ||
      l.href === '#rent' ||
      l.href === '/#rent' ||
      l.href === '/',
  )
  if (hasRent) return [existing, false]
  const rentLink = defLinks.find((l) => l.id === 'rent')
  if (!rentLink) return [existing, false]
  const afterEq = h.navLinks.findIndex((l) => l.id === 'equipment' || l.href === '#equipment')
  const insertAt = afterEq >= 0 ? afterEq + 1 : h.navLinks.length
  const navLinks = [...h.navLinks]
  navLinks.splice(insertAt, 0, JSON.parse(JSON.stringify(rentLink)))
  return [{ ...existing, header: { ...h, navLinks } }, true]
}

// Главная: только hero + аренда; остальное — отдельные URL (миграция с v3 и ниже)
const LAYOUT_SITE_PAGES = 4

function applyDefaultPagesLayout(existing, defaults) {
  if ((existing._layoutVersion || 0) >= LAYOUT_SITE_PAGES) return [existing, false]
  const defPages = defaults.pages || []
  const defNav = defaults?.header?.navLinks
  if (!Array.isArray(defPages) || defPages.length === 0) return [existing, false]

  return [
    {
      ...existing,
      pages: JSON.parse(JSON.stringify(defPages)),
      header: {
        ...existing.header,
        navLinks: Array.isArray(defNav)
          ? JSON.parse(JSON.stringify(defNav))
          : existing.header?.navLinks,
      },
      _layoutVersion: LAYOUT_SITE_PAGES,
    },
    true,
  ]
}

try {
  if (fs.existsSync(CONTENT_FILE) && fs.existsSync(DEFAULT_CONTENT_FILE)) {
    const existing = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'))
    const defaults = JSON.parse(fs.readFileSync(DEFAULT_CONTENT_FILE, 'utf8'))
    const [merged1, changed1] = deepMergeMissing(existing, defaults)
    const [merged1b, changed1b] = applyDefaultPagesLayout(merged1, defaults)
    const [merged2, changed2] = mergeHomePageBlocks(merged1b, defaults)
    const [merged3, changed3] = mergePageSeoMissing(merged2, defaults)
    const [merged4, changed4] = mergeRentCategories(merged3, defaults)
    const [merged5, changed5] = mergeEquipmentModelImages(merged4, defaults)
    const [merged6, changed6] = mergeHeaderRentNavLink(merged5, defaults)
    if (changed1 || changed1b || changed2 || changed3 || changed4 || changed5 || changed6) {
      const tmp = CONTENT_FILE + '.tmp'
      fs.writeFileSync(tmp, JSON.stringify(merged6, null, 2), 'utf8')
      fs.renameSync(tmp, CONTENT_FILE)
      console.log(
        '[server] content.json: добавлены недостающие секции/блоки из defaultContent.json',
      )
    }
  }
} catch (err) {
  console.error('[server] migration error:', err)
}

function readContent() {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'))
  } catch (err) {
    console.error('[server] readContent error:', err)
    return {}
  }
}

function writeContent(data) {
  const tmp = CONTENT_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, CONTENT_FILE)
}

function readDefaults() {
  try {
    return JSON.parse(fs.readFileSync(DEFAULT_CONTENT_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function publicBaseUrl(content, req) {
  const fromEnv = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  const fromContent = (content?.site?.baseUrl || '').replace(/\/+$/, '')
  if (fromContent) return fromContent
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    if (host) return `${proto}://${host}`
  }
  return `http://localhost:${PORT}`
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function xmlEscape(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function normalizeSlug(p) {
  const x = (p || '/').replace(/\/+$/, '')
  return x === '' ? '/' : x
}

function pageBySlug(content, pathname) {
  const pages = content.pages || []
  const clean = normalizeSlug(pathname)
  return pages.find((p) => normalizeSlug(p.slug || '/') === clean)
}

const SITEMAP_CHANGEFREQ = new Set([
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
])

/** Первое изображение для OG: массив page.seo.images или legacy imageUrl */
function firstSeoPreviewImage(seo) {
  if (!seo || typeof seo !== 'object') return { url: '', alt: '' }
  const imgs = seo.images
  if (Array.isArray(imgs)) {
    for (const entry of imgs) {
      if (entry == null) continue
      const url =
        typeof entry === 'string'
          ? entry
          : String(entry.url || entry.imageUrl || '').trim()
      const u = String(url).trim()
      if (u) {
        const alt =
          typeof entry === 'object'
            ? String(entry.alt || entry.imageAlt || '').trim()
            : ''
        return { url: u, alt }
      }
    }
  }
  const u = String(seo.imageUrl || '').trim()
  if (u) return { url: u, alt: String(seo.imageAlt || '').trim() }
  return { url: '', alt: '' }
}

function seoForPath(content, pathname) {
  const defaults = content.seo || {}
  const site = content.site || {}
  const page = pageBySlug(content, pathname)
  const pageSeo = page?.seo || {}
  const brand = site.brandName || 'Сайт'
  const pageImg = firstSeoPreviewImage(pageSeo)
  const fallbackUrl = String(defaults.defaultImage || '').trim()
  const fallbackAlt = String(defaults.defaultOgImageAlt || '').trim()
  return {
    title: pageSeo.title || defaults.defaultTitle || brand,
    description: pageSeo.description || defaults.defaultDescription || '',
    keywords: pageSeo.keywords || defaults.defaultKeywords || '',
    imageUrl: pageImg.url || fallbackUrl || '',
    imageAlt: pageImg.alt || fallbackAlt || `${brand} — превью`,
    ogType: pageSeo.ogType || defaults.defaultOgType || 'website',
    articlePublishedTime: pageSeo.articlePublishedTime || '',
    articleModifiedTime: pageSeo.articleModifiedTime || '',
    robots: pageSeo.noIndex
      ? 'noindex,nofollow'
      : pageSeo.robots || defaults.robots || 'index,follow',
    canonical: String(pageSeo.canonicalUrl || pathname || '/').trim() || '/',
  }
}

function jsonLdLanguage(locale) {
  if (!locale || typeof locale !== 'string') return 'ru-KZ'
  return locale.replace('_', '-')
}

function pageHasFaqEnabled(content, pathname) {
  const page = pageBySlug(content, pathname)
  if (!page) return false
  return (page.blocks || []).some((b) => b.type === 'faq' && b.enabled !== false)
}

function buildFaqJsonLd(content) {
  const items = content.faq?.items
  if (!Array.isArray(items) || items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

function omitEmptyDeep(value) {
  if (value === null || value === undefined || value === '') return undefined
  if (Array.isArray(value)) {
    const arr = value.map(omitEmptyDeep).filter((v) => v !== undefined && v !== '')
    return arr.length ? arr : undefined
  }
  if (typeof value === 'object') {
    const o = {}
    for (const [k, v] of Object.entries(value)) {
      const x = omitEmptyDeep(v)
      if (x !== undefined) o[k] = x
    }
    return Object.keys(o).length ? o : undefined
  }
  return value
}

function parseJsonLdBlocks(raw) {
  const txt = String(raw || '').trim()
  if (!txt) return []
  try {
    const parsed = JSON.parse(txt)
    if (Array.isArray(parsed)) return parsed.filter((x) => x && typeof x === 'object')
    if (parsed && typeof parsed === 'object') return [parsed]
    return []
  } catch {
    return []
  }
}

function buildJsonLd(content, seo, canonical, pathname, baseUrl) {
  const site = content.site || {}
  const contact = content.contact || {}
  const header = content.header || {}
  const globalSeo = content.seo || {}
  const rootUrl = `${baseUrl.replace(/\/+$/, '')}/`
  const phone = contact.phone || ''
  const logoUrl = header.logoImageUrl
    ? new URL(header.logoImageUrl, rootUrl).toString()
    : undefined
  const ogAbs = seo.imageUrl ? new URL(seo.imageUrl, rootUrl).toString() : undefined
  const orgId = `${rootUrl}#localbusiness`

  const sameAs = [contact.instagramUrl, contact.tiktokUrl].filter(Boolean)
  const org = omitEmptyDeep({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': orgId,
    name: site.brandName || 'Site',
    description: seo.description || globalSeo.defaultDescription || '',
    url: rootUrl,
    telephone: phone || undefined,
    email: contact.email || undefined,
    image: ogAbs,
    logo: logoUrl,
    address: contact.address
      ? { '@type': 'PostalAddress', streetAddress: contact.address }
      : undefined,
    areaServed: { '@type': 'Country', name: 'Kazakhstan' },
    sameAs: sameAs.length ? sameAs : undefined,
  })

  const website = omitEmptyDeep({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${rootUrl}#website`,
    name: site.brandName || 'Site',
    url: rootUrl,
    description: site.tagline || seo.description || globalSeo.defaultDescription || '',
    inLanguage: jsonLdLanguage(site.defaultLocale),
    publisher: { '@id': orgId },
  })

  const out = [org, website].filter(Boolean)
  if (pageHasFaqEnabled(content, pathname)) {
    const faqLd = buildFaqJsonLd(content)
    if (faqLd) out.push(faqLd)
  }
  return out
}

function renderHead(content, pathname, baseUrl) {
  const seo = seoForPath(content, pathname)
  const canonical = new URL(seo.canonical, baseUrl).toString()
  const ogImage = seo.imageUrl
    ? new URL(seo.imageUrl, baseUrl).toString()
    : ''
  const site = content.site || {}
  const globalSeo = content.seo || {}
  const page = pageBySlug(content, pathname)
  const pageSeo = page?.seo || {}
  const ogW = globalSeo.ogImageWidth || 1200
  const ogH = globalSeo.ogImageHeight || 630
  const ga = globalSeo.googleAnalyticsId || ''
  const ym = globalSeo.yandexMetrikaId || ''
  const gv = globalSeo.googleSiteVerification || ''
  const yv = globalSeo.yandexVerification || ''
  const bv = globalSeo.bingSiteVerification || ''
  const fbApp = globalSeo.facebookAppId || ''
  const twSite = (globalSeo.twitterSite || '').replace(/^@/, '')
  const twCreator = (globalSeo.twitterCreator || '').replace(/^@/, '')
  const twCard = String(globalSeo.twitterCard || '').trim()
  const metaAuthor = globalSeo.metaAuthor || site.brandName || ''
  const geoRegion = String(globalSeo.geoRegion || '').trim()
  const geoPlacename = String(globalSeo.geoPlacename || '').trim()
  const geoPosition = String(globalSeo.geoPosition || '').trim()
  const icbm = String(globalSeo.icbm || '').trim()
  const hreflang = Array.isArray(globalSeo.hreflangAlternates) ? globalSeo.hreflangAlternates : []
  const jsonLd = buildJsonLd(content, seo, canonical, pathname, baseUrl)
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('')
  const customJsonLd = [
    ...parseJsonLdBlocks(globalSeo.schemaJsonLd),
    ...parseJsonLdBlocks(pageSeo.schemaJsonLd),
  ]
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('')

  const hreflangTags = hreflang
    .filter((x) => x && x.hreflang && x.href)
    .map(
      (x) =>
        `<link rel="alternate" hreflang="${escapeHtml(x.hreflang)}" href="${escapeHtml(x.href)}" />`,
    )
    .join('\n')

  const verificationTags = [
    gv ? `<meta name="google-site-verification" content="${escapeHtml(gv)}" />` : '',
    yv ? `<meta name="yandex-verification" content="${escapeHtml(yv)}" />` : '',
    bv ? `<meta name="msvalidate.01" content="${escapeHtml(bv)}" />` : '',
  ].join('')

  const analyticsTags = [
    ga
      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(ga)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeHtml(ga)}');</script>`
      : '',
    ym
      ? `<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${escapeHtml(ym)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});</script>`
      : '',
  ].join('')

  const ogType = seo.ogType || 'website'
  const articlePublished =
    ogType === 'article' && seo.articlePublishedTime
      ? `<meta property="article:published_time" content="${escapeHtml(seo.articlePublishedTime)}" />`
      : ''
  const articleModified =
    ogType === 'article' && seo.articleModifiedTime
      ? `<meta property="article:modified_time" content="${escapeHtml(seo.articleModifiedTime)}" />`
      : ''
  const twitterCard = twCard || (ogImage ? 'summary_large_image' : 'summary')

  return `<title>${escapeHtml(seo.title)}</title>
<meta name="description" content="${escapeHtml(seo.description)}" />
<meta name="keywords" content="${escapeHtml(seo.keywords)}" />
<meta name="robots" content="${escapeHtml(seo.robots)}" />
${metaAuthor ? `<meta name="author" content="${escapeHtml(metaAuthor)}" />` : ''}
${geoRegion ? `<meta name="geo.region" content="${escapeHtml(geoRegion)}" />` : ''}
${geoPlacename ? `<meta name="geo.placename" content="${escapeHtml(geoPlacename)}" />` : ''}
${geoPosition ? `<meta name="geo.position" content="${escapeHtml(geoPosition)}" />` : ''}
${icbm ? `<meta name="ICBM" content="${escapeHtml(icbm)}" />` : ''}
<link rel="canonical" href="${escapeHtml(canonical)}" />
${hreflangTags ? `${hreflangTags}\n` : ''}
<meta property="og:type" content="${escapeHtml(ogType)}" />
<meta property="og:locale" content="${escapeHtml(site.defaultLocale || 'ru_KZ')}" />
<meta property="og:site_name" content="${escapeHtml(site.brandName || 'Site')}" />
<meta property="og:title" content="${escapeHtml(seo.title)}" />
<meta property="og:description" content="${escapeHtml(seo.description)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />
<meta property="og:image:width" content="${escapeHtml(String(ogW))}" />
<meta property="og:image:height" content="${escapeHtml(String(ogH))}" />
<meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />` : ''}
${fbApp ? `<meta property="fb:app_id" content="${escapeHtml(fbApp)}" />` : ''}
${articlePublished}
${articleModified}
<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />
<meta name="twitter:title" content="${escapeHtml(seo.title)}" />
<meta name="twitter:description" content="${escapeHtml(seo.description)}" />
${twSite ? `<meta name="twitter:site" content="@${escapeHtml(twSite)}" />` : ''}
${twCreator ? `<meta name="twitter:creator" content="@${escapeHtml(twCreator)}" />` : ''}
${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />
<meta name="twitter:image:alt" content="${escapeHtml(seo.imageAlt)}" />` : ''}
${verificationTags}
${jsonLd}
${customJsonLd}
${analyticsTags}`
}

function sitemapPriorityForPage(p) {
  const raw = p.seo?.sitemapPriority
  if (raw === undefined || raw === null || String(raw).trim() === '')
    return p.slug === '/' ? '1.0' : '0.8'
  const n = Number(raw)
  if (Number.isNaN(n)) return p.slug === '/' ? '1.0' : '0.8'
  const c = Math.min(1, Math.max(0, n))
  return String(Math.round(c * 10) / 10)
}

function buildSitemap(content, baseUrl) {
  const pages = (content.pages || []).filter((p) => !p.seo?.noIndex)
  const urls = pages.map((p) => {
    const loc = new URL(p.slug || '/', baseUrl).toString()
    const lastmodRaw = p.seo?.sitemapLastmod
    let lastmodLine = ''
    if (lastmodRaw && String(lastmodRaw).trim()) {
      const d = new Date(lastmodRaw)
      if (!Number.isNaN(d.getTime())) {
        lastmodLine = `\n    <lastmod>${xmlEscape(d.toISOString().slice(0, 10))}</lastmod>`
      }
    }
    const cf = SITEMAP_CHANGEFREQ.has(p.seo?.sitemapChangefreq)
      ? p.seo.sitemapChangefreq
      : 'weekly'
    const pr = sitemapPriorityForPage(p)
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmodLine}
    <changefreq>${cf}</changefreq>
    <priority>${pr}</priority>
  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

function verifyPassword(submitted) {
  if (typeof submitted !== 'string' || !submitted) return false
  if (ADMIN_PASSWORD_HASH) {
    try {
      return bcrypt.compareSync(submitted, ADMIN_PASSWORD_HASH)
    } catch {
      return false
    }
  }
  const a = Buffer.from(String(ADMIN_PASSWORD))
  const b = Buffer.from(String(submitted))
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Не авторизован' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Сессия истекла, войдите заново' })
  }
}

const loginAttempts = new Map()
function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 }
  if (record.blockedUntil > now) {
    const sec = Math.ceil((record.blockedUntil - now) / 1000)
    return res.status(429).json({ error: `Слишком много попыток. Попробуйте через ${sec} сек.` })
  }
  if (now - (record.lastTry || 0) > 60_000) record.count = 0
  record.lastTry = now
  loginAttempts.set(ip, record)
  next()
}

async function createServer() {
  const app = express()
  app.use(compression())
  app.use(cors())
  app.use(express.json({ limit: '5mb' }))

  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }))

  // ------------- API -------------
  app.post('/api/login', rateLimitLogin, (req, res) => {
    const { password } = req.body || {}
    if (!verifyPassword(password)) {
      const ip = req.ip || 'unknown'
      const record = loginAttempts.get(ip) || { count: 0 }
      record.count = (record.count || 0) + 1
      if (record.count >= 5) {
        record.blockedUntil = Date.now() + 5 * 60_000
        record.count = 0
      }
      loginAttempts.set(ip, record)
      return res.status(401).json({ error: 'Неверный пароль' })
    }
    loginAttempts.delete(req.ip)
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, expiresIn: 7 * 24 * 60 * 60 })
  })

  app.get('/api/me', authRequired, (_req, res) => res.json({ ok: true }))

  app.get('/api/content', (_req, res) => res.json(readContent()))

  app.put('/api/content', authRequired, (req, res) => {
    const data = req.body
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Некорректный формат контента' })
    }
    try {
      writeContent(data)
      res.json({ ok: true })
    } catch (err) {
      console.error('[server] writeContent error:', err)
      res.status(500).json({ error: 'Не удалось сохранить контент' })
    }
  })

  app.post('/api/content/reset', authRequired, (_req, res) => {
    if (!fs.existsSync(DEFAULT_CONTENT_FILE)) {
      return res.status(500).json({ error: 'defaultContent.json отсутствует' })
    }
    fs.copyFileSync(DEFAULT_CONTENT_FILE, CONTENT_FILE)
    res.json({ ok: true, content: readContent() })
  })

  app.get('/api/defaults', authRequired, (_req, res) => res.json(readDefaults()))

  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase().slice(0, 8)
        const safe = crypto.randomBytes(10).toString('hex')
        cb(null, `${Date.now()}-${safe}${ext || ''}`)
      },
    }),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (/^image\//.test(file.mimetype)) cb(null, true)
      else cb(new Error('Можно загружать только изображения'))
    },
  })

  app.post('/api/upload', authRequired, (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message })
      if (!req.file) return res.status(400).json({ error: 'Файл не получен' })
      res.json({ url: `/uploads/${req.file.filename}`, size: req.file.size })
    })
  })

  // ------------- SEO endpoints -------------
  app.get('/robots.txt', (req, res) => {
    const content = readContent()
    const base = publicBaseUrl(content, req)
    const extra = String(content.seo?.robotsTxtExtra || '').trim()
    const core = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${base.replace(/\/$/, '')}/sitemap.xml`
    res.type('text/plain').send(extra ? `${core}\n\n${extra}` : core)
  })

  app.get('/sitemap.xml', (req, res) => {
    const content = readContent()
    const base = publicBaseUrl(content, req)
    res.type('application/xml').send(buildSitemap(content, base))
  })

  // ------------- SSR + статика клиента -------------
  let vite
  let prodTemplate = ''
  let prodRender = null
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite')
    vite = await createViteServer({
      root: ROOT,
      server: { middlewareMode: true },
      appType: 'custom',
    })
    app.use(vite.middlewares)
  } else {
    const sirv = (await import('sirv')).default
    app.use(
      '/assets',
      sirv(path.join(ROOT, 'dist/client/assets'), {
        gzip: true,
        brotli: true,
        maxAge: 60 * 60 * 24 * 30,
        immutable: true,
      }),
    )
    app.use(
      '/',
      sirv(path.join(ROOT, 'dist/client'), {
        extensions: ['svg', 'png', 'jpg', 'jpeg', 'webp', 'ico', 'txt', 'json'],
        gzip: true,
        brotli: true,
        maxAge: 60 * 60,
        ignores: [/^\/$/, /^\/admin/, /^\/api\//],
      }),
    )
    prodTemplate = fs.readFileSync(path.join(ROOT, 'dist/client/index.html'), 'utf8')
    const ssrModule = await import(
      pathToFileURL(path.join(ROOT, 'dist/server/entry-server.js')).href
    )
    prodRender = ssrModule.render
  }

  app.use(/^\/(?!api\/|uploads\/|robots\.txt|sitemap\.xml).*/, async (req, res, next) => {
    try {
      const url = req.originalUrl
      const content = readContent()
      const baseUrl = publicBaseUrl(content, req)
      const head = renderHead(content, req.path, baseUrl)

      let template
      let render
      if (!IS_PROD) {
        template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render
      } else {
        template = prodTemplate
        render = prodRender
      }

      const { html: appHtml, status = 200 } = await render(url, content)

      const html = template
        .replace('<!--ssr-head-->', head)
        .replace(
          '<!--ssr-state-->',
          `<script>window.__CONTENT__=${JSON.stringify(content).replace(
            /</g,
            '\\u003c',
          )}</script>`,
        )
        .replace('<!--ssr-outlet-->', appHtml)

      res.status(status).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (err) {
      if (vite) vite.ssrFixStacktrace(err)
      console.log('[ssr] error:', err && err.stack ? err.stack : err)
      const body = IS_PROD
        ? 'Внутренняя ошибка сервера'
        : `<pre style="padding:24px;color:#fca5a5;background:#1e1b4b;font:13px ui-monospace">SSR error:\n${(err.stack || err.message || String(err))
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')}</pre>`
      res.status(500).set({ 'Content-Type': 'text/html' }).end(body)
    }
  })

  app.use((err, _req, res, _next) => {
    console.log('[server] unhandled error:', err && err.stack ? err.stack : err)
    res.status(500).send(IS_PROD ? 'Внутренняя ошибка сервера' : String(err.stack || err))
  })

  return app
}

createServer().then((app) => {
  app.listen(PORT, HOST, () => {
    const shown = HOST === '0.0.0.0' ? 'localhost' : HOST
    console.log(
      `[server] ${IS_PROD ? 'production' : 'development'} mode — http://${shown}:${PORT}`,
    )
    console.log(`[server] admin → http://${shown}:${PORT}/admin`)
  })
})
