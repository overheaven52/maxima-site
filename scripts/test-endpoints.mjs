import fs from 'node:fs'

const HOST = process.env.TEST_HOST || 'http://127.0.0.1:3001'
const out = []
function log(...a) {
  out.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '))
}

try {
  const a = await fetch(`${HOST}/api/content`)
  const aj = await a.json()
  log('api/content:', a.status, 'brand=', aj.site?.brandName, 'pages=', aj.pages?.length)

  const b = await fetch(`${HOST}/sitemap.xml`)
  log('sitemap:', b.status, (await b.text()).slice(0, 100))

  const c = await fetch(`${HOST}/robots.txt`)
  log('robots:', c.status, (await c.text()).slice(0, 80))

  const d = await fetch(`${HOST}/`)
  const dt = await d.text()
  log('home:', d.status, 'len=', dt.length)
  if (d.status >= 400) {
    log('--- BODY (first 2000) ---')
    log(dt.slice(0, 2000))
    log('--- END BODY ---')
  }
  log('  has <title>?', /<title>[^<]+<\/title>/.test(dt))
  log(
    '  has hero text?',
    dt.includes('Безупречная чистота') ||
      dt.includes('коммерческих объектов') ||
      dt.includes('Richess'),
  )
  log('  has about section?', dt.includes('О компании') || dt.includes('эксперт в области'))
  log('  has industries section?', dt.includes('Бизнес-центры') || dt.includes('ТРЦ'))
  log('  has technology section?', dt.includes('безведерной уборки') || dt.includes('подготовленных мопов'))
  log('  has equipment section?', dt.includes('Tennant') || dt.includes('Оборудование'))
  log('  has faq section?', dt.includes('FAQ') || dt.includes('Часто задаваемые'))
  log('  has og:title?', /og:title/.test(dt))
  log('  has json-ld?', dt.includes('LocalBusiness'))
  log('  has client script?', /entry-client|\/assets\/index-/.test(dt))
  log('  ssr-state present?', /__CONTENT__/.test(dt))

  const e = await fetch(`${HOST}/admin`)
  const et = await e.text()
  log('admin:', e.status, 'len=', et.length)
  log('  has Войти?', et.includes('Войти'))

  const nf = await fetch(`${HOST}/no-such-page-12345`)
  const nft = await nf.text()
  log('404:', nf.status, 'has 404 page?', nft.includes('Страница не найдена'))

  const f = await fetch(`${HOST}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'deda123321' }),
  })
  const fj = await f.json()
  log('login:', f.status, fj.token ? 'got_token' : JSON.stringify(fj))
} catch (err) {
  log('ERROR:', err.message)
}

fs.writeFileSync('test-endpoints.log', out.join('\n'), 'utf8')
console.log(out.join('\n'))
