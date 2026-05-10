import { useEffect, useState, useMemo } from 'react'
import { api } from '../api/client.js'
import { useContentApi } from '../content/ContentContext.jsx'
import {
  TextField,
  TextArea,
  CheckboxField,
  ImageField,
  ImagesListField,
  ListEditor,
  FieldGroup,
} from './AdminFields.jsx'

const OG_TYPES = [
  { value: '', label: '— по умолчанию (website)' },
  { value: 'website', label: 'website' },
  { value: 'article', label: 'article' },
]

const SITEMAP_FREQ = [
  { value: '', label: '— weekly' },
  { value: 'always', label: 'always' },
  { value: 'hourly', label: 'hourly' },
  { value: 'daily', label: 'daily' },
  { value: 'weekly', label: 'weekly' },
  { value: 'monthly', label: 'monthly' },
  { value: 'yearly', label: 'yearly' },
  { value: 'never', label: 'never' },
]

const TABS = [
  { id: 'site', label: 'Сайт' },
  { id: 'seo', label: 'SEO' },
  { id: 'header', label: 'Шапка' },
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'О компании' },
  { id: 'cleaning', label: 'Услуги' },
  { id: 'industries', label: 'Отрасли' },
  { id: 'technology', label: 'Технологии' },
  { id: 'equipment', label: 'Оборудование' },
  { id: 'geography', label: 'География' },
  { id: 'faq', label: 'FAQ' },
  { id: 'rent', label: 'Аренда' },
  { id: 'social', label: 'Соцсети' },
  { id: 'contact', label: 'Контакты' },
  { id: 'footer', label: 'Подвал' },
  { id: 'pages', label: 'Страницы и разделы' },
]

export default function AdminEditor({ onLogout }) {
  const { setContent: setGlobalContent } = useContentApi()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('site')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getContent()
      .then((c) => setContent(c))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const update = useMemo(
    () => (path, value) => {
      setContent((prev) => setIn(prev, path, value))
    },
    [],
  )

  async function save() {
    setSaving(true)
    setError('')
    try {
      await api.saveContent(content)
      setSavedAt(new Date())
      setGlobalContent(content)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function resetToDefaults() {
    if (!confirm('Сбросить весь контент к шаблону по умолчанию?')) return
    try {
      const { content: fresh } = await api.resetContent()
      setContent(fresh)
      setGlobalContent(fresh)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-[#06152d] grid place-items-center text-slate-400">
        Загрузка контента…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06152d] text-slate-100 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 bg-[#06152d]/95 backdrop-blur border-b border-white/10 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex flex-col gap-3 py-3 sm:py-0 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 grid place-items-center rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-sm">
                {((content.site?.brandName) || 'M').trim().charAt(0).toUpperCase()}
              </div>
              <div className="text-sm sm:text-base font-semibold truncate min-w-0">
                Админ {(content.site?.brandName) || 'MAXIMA'}
              </div>
            </div>
            <div className="flex flex-wrap items-stretch sm:items-center gap-2">
              {savedAt && (
                <span className="text-xs text-cyan-300/80 hidden md:inline self-center">
                  Сохранено: {savedAt.toLocaleTimeString()}
                </span>
              )}
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center text-sm min-h-11 px-4 rounded-lg border border-white/10 hover:border-cyan-400/40 text-slate-200 touch-manip"
              >
                Сайт
              </a>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="text-sm min-h-11 px-5 rounded-lg bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 disabled:opacity-50 transition touch-manip"
              >
                {saving ? 'Сохраняем…' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-sm min-h-11 px-4 rounded-lg border border-white/10 text-slate-300 hover:text-white touch-manip"
              >
                Выйти
              </button>
            </div>
          </div>
          <div
            className="admin-tabs-scroll flex gap-1 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'thin' }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`snap-start shrink-0 min-h-11 px-3 sm:px-3.5 py-2.5 text-sm rounded-t-lg whitespace-nowrap transition touch-manip ${
                  tab === t.id
                    ? 'bg-white/[0.06] text-cyan-200 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3">
            {error}
          </div>
        )}

        {tab === 'site' && <SiteTab content={content} update={update} onReset={resetToDefaults} />}
        {tab === 'seo' && <SeoTab content={content} update={update} />}
        {tab === 'header' && <HeaderTab content={content} update={update} />}
        {tab === 'hero' && <HeroTab content={content} update={update} />}
        {tab === 'about' && <AboutTab content={content} update={update} />}
        {tab === 'cleaning' && <CleaningTab content={content} update={update} />}
        {tab === 'industries' && <IndustriesTab content={content} update={update} />}
        {tab === 'technology' && <TechnologyTab content={content} update={update} />}
        {tab === 'equipment' && <EquipmentTab content={content} update={update} />}
        {tab === 'geography' && <GeographyTab content={content} update={update} />}
        {tab === 'faq' && <FaqTab content={content} update={update} />}
        {tab === 'rent' && <RentTab content={content} update={update} />}
        {tab === 'social' && <SocialTab content={content} update={update} />}
        {tab === 'contact' && <ContactTab content={content} update={update} />}
        {tab === 'footer' && <FooterTab content={content} update={update} />}
        {tab === 'pages' && <PagesTab content={content} update={update} />}
      </main>
    </div>
  )
}

// ----------- утилита глубокого set по пути ['a','b',2] -----------
function setIn(obj, path, value) {
  if (path.length === 0) return value
  const [head, ...rest] = path
  const isArray = typeof head === 'number'
  const current = isArray ? [...(obj || [])] : { ...(obj || {}) }
  current[head] = setIn(current[head], rest, value)
  return current
}

// =============== ВКЛАДКИ ===============

function SiteTab({ content, update, onReset }) {
  const site = content.site || {}
  return (
    <FieldGroup
      title="Общие настройки сайта"
      description="Бренд, домен и базовые цвета. Эти значения видны в SEO и заголовке."
    >
      <TextField
        label="Название бренда"
        value={site.brandName}
        onChange={(v) => update(['site', 'brandName'], v)}
      />
      <TextField
        label="Слоган"
        value={site.tagline}
        onChange={(v) => update(['site', 'tagline'], v)}
      />
      <TextField
        label="Базовый URL сайта"
        value={site.baseUrl}
        onChange={(v) => update(['site', 'baseUrl'], v)}
        hint="Используется в SEO/sitemap. Меняется при переезде на другой домен (или задаётся через переменную PUBLIC_BASE_URL в .env)."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField
          label="Цвет акцента"
          value={site.primaryColor}
          onChange={(v) => update(['site', 'primaryColor'], v)}
          hint="HEX, например #22d3ee"
        />
        <TextField
          label="Цвет фона"
          value={site.backgroundColor}
          onChange={(v) => update(['site', 'backgroundColor'], v)}
          hint="HEX, например #06152d"
        />
      </div>
      <div className="pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={onReset}
          className="text-xs px-3 py-1.5 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/10"
        >
          Сбросить весь контент к шаблону
        </button>
      </div>
    </FieldGroup>
  )
}

function SeoTab({ content, update }) {
  const seo = content.seo || {}
  return (
    <>
      <FieldGroup
        title="SEO по умолчанию"
        description="Эти значения берутся, если у конкретной страницы не задан собственный SEO. Сервер рендерит их в <head> до загрузки JavaScript — поэтому Google и Yandex видят правильный заголовок и описание сразу."
      >
        <TextField
          label="Title по умолчанию"
          value={seo.defaultTitle}
          onChange={(v) => update(['seo', 'defaultTitle'], v)}
          hint="Главный заголовок в выдаче (до 60 символов)"
        />
        <TextArea
          label="Description по умолчанию"
          value={seo.defaultDescription}
          onChange={(v) => update(['seo', 'defaultDescription'], v)}
          hint="Описание сайта в выдаче (до 160 символов)"
          rows={3}
        />
        <TextField
          label="Keywords"
          value={seo.defaultKeywords}
          onChange={(v) => update(['seo', 'defaultKeywords'], v)}
          hint="Через запятую. Малозначимы для Google, важны для Yandex."
        />
        <ImageField
          label="OG-изображение по умолчанию"
          value={seo.defaultImage}
          onChange={(v) => update(['seo', 'defaultImage'], v)}
          hint="Картинка в превью при шаринге в WhatsApp/Telegram. 1200×630 идеально."
        />
        <TextField
          label="Alt-текст для OG-картинки (по умолчанию)"
          value={seo.defaultOgImageAlt}
          onChange={(v) => update(['seo', 'defaultOgImageAlt'], v)}
          hint="Для доступности и некоторых соцсетей (og:image:alt)."
        />
        <label className="block">
          <div className="text-sm text-slate-300">Open Graph type по умолчанию</div>
          <select
            value={seo.defaultOgType || 'website'}
            onChange={(e) => update(['seo', 'defaultOgType'], e.target.value)}
            className="mt-1 w-full max-w-md rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2 text-white"
          >
            {OG_TYPES.filter((o) => o.value !== '').map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="OG image width (px)"
            value={seo.ogImageWidth != null ? String(seo.ogImageWidth) : ''}
            onChange={(v) => update(['seo', 'ogImageWidth'], v === '' ? 1200 : Number(v) || 1200)}
            hint="Часто 1200"
          />
          <TextField
            label="OG image height (px)"
            value={seo.ogImageHeight != null ? String(seo.ogImageHeight) : ''}
            onChange={(v) => update(['seo', 'ogImageHeight'], v === '' ? 630 : Number(v) || 630)}
            hint="Часто 630"
          />
        </div>
        <TextField
          label="robots"
          value={seo.robots}
          onChange={(v) => update(['seo', 'robots'], v)}
          hint="index,follow — открыто для поисковиков. noindex,nofollow — закрыто."
        />
      </FieldGroup>

      <FieldGroup
        title="Соцсети и расширенный Open Graph"
        description="Twitter/X и Facebook используют эти поля для корректных карточек и статистики."
      >
        <TextField
          label="Facebook App ID (fb:app_id)"
          value={seo.facebookAppId}
          onChange={(v) => update(['seo', 'facebookAppId'], v)}
          placeholder="необязательно"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="Twitter / X site (@username без @)"
            value={seo.twitterSite}
            onChange={(v) => update(['seo', 'twitterSite'], v)}
            placeholder="brand_handle"
          />
          <TextField
            label="Twitter / X creator (@username без @)"
            value={seo.twitterCreator}
            onChange={(v) => update(['seo', 'twitterCreator'], v)}
          />
        </div>
        <TextField
          label="meta author (имя для выдачи)"
          value={seo.metaAuthor}
          onChange={(v) => update(['seo', 'metaAuthor'], v)}
          hint="По умолчанию можно оставить название бренда."
        />
      </FieldGroup>

      <FieldGroup
        title="Мультиязычность (hreflang)"
        description="Добавьте альтернативные URL для тех же страниц на других языках или регионах (x-default — по желанию)."
      >
        <ListEditor
          label="Альтернативные версии"
          items={seo.hreflangAlternates || []}
          onChange={(v) => update(['seo', 'hreflangAlternates'], v)}
          makeNew={() => ({ hreflang: 'x-default', href: '' })}
          renderItem={(row, set) => (
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label="hreflang"
                value={row.hreflang}
                onChange={(v) => set({ ...row, hreflang: v })}
                hint="kk, ru, en, x-default…"
              />
              <TextField label="Полный URL" value={row.href} onChange={(v) => set({ ...row, href: v })} />
            </div>
          )}
        />
      </FieldGroup>

      <FieldGroup
        title="robots.txt — свой текст в конце файла"
        description="Дополнительные правила или комментарии (добавятся после стандартных строк с Sitemap)."
      >
        <TextArea
          label="Дополнительно в robots.txt"
          value={seo.robotsTxtExtra || ''}
          onChange={(v) => update(['seo', 'robotsTxtExtra'], v)}
          rows={4}
          hint="Например: Crawl-delay или отдельные User-agent блоки."
        />
      </FieldGroup>

      <FieldGroup
        title="Аналитика и подтверждение прав"
        description="Просто вставьте свои ID — теги добавятся в <head> автоматически."
      >
        <TextField
          label="Google Analytics ID"
          value={seo.googleAnalyticsId}
          onChange={(v) => update(['seo', 'googleAnalyticsId'], v)}
          placeholder="G-XXXXXXX"
        />
        <TextField
          label="Яндекс.Метрика ID"
          value={seo.yandexMetrikaId}
          onChange={(v) => update(['seo', 'yandexMetrikaId'], v)}
          placeholder="12345678"
        />
        <TextField
          label="Google Search Console verification"
          value={seo.googleSiteVerification}
          onChange={(v) => update(['seo', 'googleSiteVerification'], v)}
          hint="Содержимое meta-тега google-site-verification"
        />
        <TextField
          label="Яндекс.Вебмастер verification"
          value={seo.yandexVerification}
          onChange={(v) => update(['seo', 'yandexVerification'], v)}
        />
        <TextField
          label="Bing Webmaster (msvalidate.01)"
          value={seo.bingSiteVerification}
          onChange={(v) => update(['seo', 'bingSiteVerification'], v)}
        />
      </FieldGroup>
    </>
  )
}

function HeaderTab({ content, update }) {
  const header = content.header || {}
  return (
    <>
      <FieldGroup title="Шапка">
        <TextField
          label="Текст логотипа"
          value={header.logoText}
          onChange={(v) => update(['header', 'logoText'], v)}
        />
        <TextField
          label="Подпись под логотипом"
          value={header.logoSubtitle}
          onChange={(v) => update(['header', 'logoSubtitle'], v)}
        />
        <ImageField
          label="Логотип (картинка) — необязательно"
          value={header.logoImageUrl}
          onChange={(v) => update(['header', 'logoImageUrl'], v)}
          hint="Если задан, в шапке показывается только картинка (без дублирования текста рядом)"
        />
        <TextField
          label="Alt-текст логотипа (доступность и SEO)"
          value={header.logoImageAlt}
          onChange={(v) => update(['header', 'logoImageAlt'], v)}
          hint="Кратко опишите логотип для screen reader и поисковиков"
        />
        <TextField
          label="Текст CTA-кнопки в шапке"
          value={header.ctaButtonText}
          onChange={(v) => update(['header', 'ctaButtonText'], v)}
        />
        <TextField
          label="Ссылка CTA-кнопки"
          value={header.ctaButtonHref}
          onChange={(v) => update(['header', 'ctaButtonHref'], v)}
          hint="Можно URL или якорь, например #contact"
        />
      </FieldGroup>

      <FieldGroup title="Меню в шапке">
        <ListEditor
          label="Пункты меню"
          items={header.navLinks || []}
          onChange={(v) => update(['header', 'navLinks'], v)}
          makeNew={() => ({ id: `link-${Date.now()}`, label: 'Новый пункт', href: '#' })}
          renderItem={(item, set) => (
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField label="Название" value={item.label} onChange={(v) => set({ ...item, label: v })} />
              <TextField label="Ссылка" value={item.href} onChange={(v) => set({ ...item, href: v })} />
            </div>
          )}
        />
      </FieldGroup>
    </>
  )
}

function HeroTab({ content, update }) {
  const hero = content.hero || {}
  return (
    <>
      <FieldGroup title="Главный экран (Hero)">
        <TextField
          label="Надзаголовок (eyebrow)"
          value={hero.eyebrow}
          onChange={(v) => update(['hero', 'eyebrow'], v)}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField label="Заголовок" value={hero.title} onChange={(v) => update(['hero', 'title'], v)} />
          <TextField
            label="Заголовок (подсветка)"
            value={hero.titleHighlight}
            onChange={(v) => update(['hero', 'titleHighlight'], v)}
            hint="Эта часть выделится неоновым градиентом"
          />
        </div>
        <TextArea
          label="Подзаголовок"
          value={hero.subtitle}
          onChange={(v) => update(['hero', 'subtitle'], v)}
          rows={3}
        />
        <ImagesListField
          label="Галерея изображений"
          value={hero.images}
          onChange={(v) => update(['hero', 'images'], v)}
          hint="Несколько фото — горизонтальная полоса под кнопками. Если список пуст, используется одно фото ниже."
        />
        <ImageField
          label="Одно изображение (если галерея пуста)"
          value={hero.imageUrl}
          onChange={(v) => update(['hero', 'imageUrl'], v)}
        />
        <TextField
          label="Alt-текст для одного изображения"
          value={hero.imageAlt}
          onChange={(v) => update(['hero', 'imageAlt'], v)}
        />
      </FieldGroup>

      <FieldGroup title="Кнопки">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="Кнопка 1 — текст"
            value={hero.primaryButton?.text}
            onChange={(v) => update(['hero', 'primaryButton', 'text'], v)}
          />
          <TextField
            label="Кнопка 1 — ссылка"
            value={hero.primaryButton?.href}
            onChange={(v) => update(['hero', 'primaryButton', 'href'], v)}
          />
          <TextField
            label="Кнопка 2 — текст"
            value={hero.secondaryButton?.text}
            onChange={(v) => update(['hero', 'secondaryButton', 'text'], v)}
          />
          <TextField
            label="Кнопка 2 — ссылка"
            value={hero.secondaryButton?.href}
            onChange={(v) => update(['hero', 'secondaryButton', 'href'], v)}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Цифры под Hero">
        <ListEditor
          label="Карточки со статистикой"
          items={hero.stats || []}
          onChange={(v) => update(['hero', 'stats'], v)}
          makeNew={() => ({ id: `stat-${Date.now()}`, value: '0', label: 'Подпись' })}
          renderItem={(item, set) => (
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField label="Значение" value={item.value} onChange={(v) => set({ ...item, value: v })} />
              <TextField label="Подпись" value={item.label} onChange={(v) => set({ ...item, label: v })} />
            </div>
          )}
        />
      </FieldGroup>
    </>
  )
}

function AboutTab({ content, update }) {
  const about = content.about || {}
  return (
    <>
      <FieldGroup
        title="Раздел «О компании»"
        description="Описание компании и блок преимуществ. Виден на главной странице, как правило, сразу после Hero."
      >
        <TextField
          label="Надзаголовок (eyebrow)"
          value={about.eyebrow}
          onChange={(v) => update(['about', 'eyebrow'], v)}
        />
        <TextField
          label="Заголовок"
          value={about.heading}
          onChange={(v) => update(['about', 'heading'], v)}
        />
        <TextArea
          label="Вступительный текст"
          value={about.intro}
          onChange={(v) => update(['about', 'intro'], v)}
          rows={4}
        />
        <ImagesListField
          label="Галерея фото"
          value={about.images}
          onChange={(v) => update(['about', 'images'], v)}
          hint="Если задана галерея, на сайте показываются все эти фото. Иначе — одно фото ниже."
        />
        <ImageField
          label="Одно фото (если галерея пуста)"
          value={about.imageUrl}
          onChange={(v) => update(['about', 'imageUrl'], v)}
        />
        <TextField
          label="Alt-текст для одного фото"
          value={about.imageAlt}
          onChange={(v) => update(['about', 'imageAlt'], v)}
        />
      </FieldGroup>

      <FieldGroup title="Блок преимуществ">
        <TextField
          label="Заголовок блока"
          value={about.advantagesTitle}
          onChange={(v) => update(['about', 'advantagesTitle'], v)}
        />
        <ListEditor
          label="Преимущества"
          items={about.advantages || []}
          onChange={(v) => update(['about', 'advantages'], v)}
          makeNew={() => ({
            id: `adv-${Date.now()}`,
            icon: '✨',
            title: 'Новое преимущество',
            description: '',
          })}
          renderItem={(item, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <TextField label="ID" value={item.id} onChange={(v) => set({ ...item, id: v })} />
                <TextField
                  label="Иконка (emoji)"
                  value={item.icon}
                  onChange={(v) => set({ ...item, icon: v })}
                />
                <TextField
                  label="Заголовок"
                  value={item.title}
                  onChange={(v) => set({ ...item, title: v })}
                />
              </div>
              <TextArea
                label="Описание"
                value={item.description}
                onChange={(v) => set({ ...item, description: v })}
                rows={3}
              />
            </div>
          )}
        />
      </FieldGroup>
    </>
  )
}

function CleaningTab({ content, update }) {
  const c = content.cleaning || {}
  return (
    <>
      <FieldGroup title="Раздел «Услуги»">
        <TextField
          label="Надзаголовок (eyebrow)"
          value={c.heading}
          onChange={(v) => update(['cleaning', 'heading'], v)}
        />
        <TextField
          label="Главный заголовок"
          value={c.leadTitle}
          onChange={(v) => update(['cleaning', 'leadTitle'], v)}
        />
        <TextArea
          label="Текст (HTML разрешён)"
          value={c.leadHtml}
          onChange={(v) => update(['cleaning', 'leadHtml'], v)}
          rows={4}
          hint="Можно использовать <strong>, <em>, <a href=>"
        />
        <ImagesListField
          label="Галерея фото"
          value={c.images}
          onChange={(v) => update(['cleaning', 'images'], v)}
          hint="Несколько снимков в колонке с текстом. Если список пуст — одно фото ниже."
        />
        <ImageField
          label="Одно фото (если галерея пуста)"
          value={c.imageUrl}
          onChange={(v) => update(['cleaning', 'imageUrl'], v)}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField label="Текст кнопки" value={c.ctaText} onChange={(v) => update(['cleaning', 'ctaText'], v)} />
          <TextField label="Ссылка кнопки" value={c.ctaHref} onChange={(v) => update(['cleaning', 'ctaHref'], v)} />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Категории услуг"
        description="Каждая категория = карточка с заголовком, описанием и списком пунктов. Например: Daily Cleaning, Спецработы, Soft Services."
      >
        <ListEditor
          label="Категории"
          items={c.categories || []}
          onChange={(v) => update(['cleaning', 'categories'], v)}
          makeNew={() => ({
            id: `cat-${Date.now()}`,
            icon: '✨',
            title: 'Новая категория',
            subtitle: '',
            description: '',
            items: [],
          })}
          renderItem={(cat, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <TextField label="ID" value={cat.id} onChange={(v) => set({ ...cat, id: v })} />
                <TextField
                  label="Иконка (emoji)"
                  value={cat.icon}
                  onChange={(v) => set({ ...cat, icon: v })}
                />
                <TextField
                  label="Заголовок"
                  value={cat.title}
                  onChange={(v) => set({ ...cat, title: v })}
                />
              </div>
              <TextField
                label="Подзаголовок"
                value={cat.subtitle}
                onChange={(v) => set({ ...cat, subtitle: v })}
              />
              <TextArea
                label="Описание"
                value={cat.description}
                onChange={(v) => set({ ...cat, description: v })}
                rows={3}
              />
              <TextArea
                label="Пункты (по одному на строку)"
                value={(cat.items || []).join('\n')}
                onChange={(v) => set({ ...cat, items: v.split('\n').filter(Boolean) })}
                rows={5}
              />
            </div>
          )}
        />
      </FieldGroup>

      <FieldGroup title="Блок «Преимущества при сотрудничестве»">
        <TextArea
          label="Преимущества (по одному на строку)"
          value={(c.highlights || []).join('\n')}
          onChange={(v) => update(['cleaning', 'highlights'], v.split('\n').filter(Boolean))}
          rows={5}
        />
      </FieldGroup>

      <FieldGroup
        title="Услуги тегами (резерв)"
        description="Если категории пусты — будет показан этот плоский список тегов. Можно использовать вместо или дополнительно."
      >
        <TextArea
          label="Услуги (по одной на строку)"
          value={(c.services || []).join('\n')}
          onChange={(v) => update(['cleaning', 'services'], v.split('\n').filter(Boolean))}
          rows={5}
        />
      </FieldGroup>
    </>
  )
}

function IndustriesTab({ content, update }) {
  const ind = content.industries || {}
  return (
    <FieldGroup
      title="Отраслевые решения"
      description="Карточки секторов с описанием и кнопкой. Если оставить только iconnabel — будет компактная сетка."
    >
      <TextField label="Заголовок" value={ind.heading} onChange={(v) => update(['industries', 'heading'], v)} />
      <TextArea
        label="Описание"
        value={ind.description}
        onChange={(v) => update(['industries', 'description'], v)}
        rows={3}
      />
      <ListEditor
        label="Сектора"
        items={ind.items || []}
        onChange={(v) => update(['industries', 'items'], v)}
        makeNew={() => ({
          id: `ind-${Date.now()}`,
          icon: '',
          label: 'Новый сектор',
          images: [],
          imageUrl: '',
          imageAlt: '',
          description: '',
          accent: '',
          ctaText: 'Заказать бесплатный аудит',
          ctaHref: '',
        })}
        renderItem={(item, set) => (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <TextField label="ID" value={item.id} onChange={(v) => set({ ...item, id: v })} />
              <TextField
                label="Иконка (emoji, необязательно)"
                value={item.icon}
                onChange={(v) => set({ ...item, icon: v })}
              />
              <TextField
                label="Название сектора"
                value={item.label}
                onChange={(v) => set({ ...item, label: v })}
              />
            </div>
            <ImagesListField
              label="Галерея фото"
              value={item.images}
              onChange={(v) => set({ ...item, images: v })}
              hint="Несколько фото в карточке. Если список пуст — одно фото ниже."
            />
            <ImageField
              label="Одно фото (если галерея пуста)"
              value={item.imageUrl}
              onChange={(v) => set({ ...item, imageUrl: v })}
            />
            <TextField
              label="Alt для одного фото"
              value={item.imageAlt}
              onChange={(v) => set({ ...item, imageAlt: v })}
            />
            <TextArea
              label="Описание"
              value={item.description}
              onChange={(v) => set({ ...item, description: v })}
              rows={3}
            />
            <TextField
              label="Ключевой акцент"
              value={item.accent}
              onChange={(v) => set({ ...item, accent: v })}
              hint="Короткий тезис в выделенной плашке"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label="Текст кнопки"
                value={item.ctaText}
                onChange={(v) => set({ ...item, ctaText: v })}
              />
              <TextField
                label="Ссылка кнопки"
                value={item.ctaHref}
                onChange={(v) => set({ ...item, ctaHref: v })}
              />
            </div>
          </div>
        )}
      />
    </FieldGroup>
  )
}

function TechnologyTab({ content, update }) {
  const t = content.technology || {}
  return (
    <>
      <FieldGroup
        title="Технологии и стандарты"
        description="Раздел про метод «безведерной уборки» и другие технологические преимущества."
      >
        <TextField
          label="Надзаголовок (eyebrow)"
          value={t.eyebrow}
          onChange={(v) => update(['technology', 'eyebrow'], v)}
        />
        <TextField
          label="Заголовок"
          value={t.heading}
          onChange={(v) => update(['technology', 'heading'], v)}
        />
        <TextArea
          label="Текст (HTML разрешён)"
          value={t.leadHtml}
          onChange={(v) => update(['technology', 'leadHtml'], v)}
          rows={4}
        />
        <ImagesListField
          label="Галерея изображений"
          value={t.images}
          onChange={(v) => update(['technology', 'images'], v)}
          hint="Несколько иллюстраций под текстом. Если список пуст — одно фото ниже."
        />
        <ImageField
          label="Одно большое изображение (если галерея пуста)"
          value={t.imageUrl}
          onChange={(v) => update(['technology', 'imageUrl'], v)}
        />
      </FieldGroup>

      <FieldGroup title="Преимущества технологии">
        <ListEditor
          label="Карточки преимуществ"
          items={t.benefits || []}
          onChange={(v) => update(['technology', 'benefits'], v)}
          makeNew={() => ({
            id: `b-${Date.now()}`,
            icon: '⚡',
            title: 'Новое преимущество',
            description: '',
          })}
          renderItem={(item, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <TextField label="ID" value={item.id} onChange={(v) => set({ ...item, id: v })} />
                <TextField
                  label="Иконка (emoji)"
                  value={item.icon}
                  onChange={(v) => set({ ...item, icon: v })}
                />
                <TextField
                  label="Заголовок"
                  value={item.title}
                  onChange={(v) => set({ ...item, title: v })}
                />
              </div>
              <TextArea
                label="Описание"
                value={item.description}
                onChange={(v) => set({ ...item, description: v })}
                rows={3}
              />
            </div>
          )}
        />
      </FieldGroup>
    </>
  )
}

function EquipmentTab({ content, update }) {
  const eq = content.equipment || {}
  return (
    <>
      <FieldGroup title="Раздел «Оборудование»">
        <TextField
          label="Надзаголовок (eyebrow)"
          value={eq.eyebrow}
          onChange={(v) => update(['equipment', 'eyebrow'], v)}
        />
        <TextField
          label="Заголовок"
          value={eq.heading}
          onChange={(v) => update(['equipment', 'heading'], v)}
        />
        <TextArea
          label="Описание"
          value={eq.description}
          onChange={(v) => update(['equipment', 'description'], v)}
          rows={4}
        />
      </FieldGroup>

      <FieldGroup
        title="Модели техники"
        description="Здесь храним модели Tennant и другую профессиональную технику с фото и описанием."
      >
        <ListEditor
          label="Модели"
          items={eq.models || []}
          onChange={(v) => update(['equipment', 'models'], v)}
          makeNew={() => ({
            id: `m-${Date.now()}`,
            name: 'Новая модель',
            type: '',
            description: '',
            images: [],
            imageUrl: '',
          })}
          renderItem={(m, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField label="ID" value={m.id} onChange={(v) => set({ ...m, id: v })} />
                <TextField label="Название" value={m.name} onChange={(v) => set({ ...m, name: v })} />
              </div>
              <TextField
                label="Тип работы (короткий тег)"
                value={m.type}
                onChange={(v) => set({ ...m, type: v })}
                hint="Например: Подметание и мойка / Мойка / Подметание"
              />
              <TextArea
                label="Описание"
                value={m.description}
                onChange={(v) => set({ ...m, description: v })}
                rows={3}
              />
              <ImagesListField
                label="Галерея фото"
                value={m.images}
                onChange={(v) => set({ ...m, images: v })}
                hint="Несколько фото в одной плитке. Если список пуст — одно фото ниже."
              />
              <ImageField
                label="Одно фото (если галерея пуста)"
                value={m.imageUrl}
                onChange={(v) => set({ ...m, imageUrl: v })}
              />
            </div>
          )}
        />
      </FieldGroup>
    </>
  )
}

function GeographyTab({ content, update }) {
  const g = content.geography || {}
  return (
    <>
      <FieldGroup title="Раздел «География и гарантии»">
        <TextField
          label="Надзаголовок (eyebrow)"
          value={g.eyebrow}
          onChange={(v) => update(['geography', 'eyebrow'], v)}
        />
        <TextField
          label="Заголовок"
          value={g.heading}
          onChange={(v) => update(['geography', 'heading'], v)}
        />
        <TextArea
          label="Описание"
          value={g.description}
          onChange={(v) => update(['geography', 'description'], v)}
          rows={3}
        />
      </FieldGroup>

      <FieldGroup title="Гарантии">
        <ListEditor
          label="Пункты"
          items={g.items || []}
          onChange={(v) => update(['geography', 'items'], v)}
          makeNew={() => ({
            id: `g-${Date.now()}`,
            icon: '🛡️',
            title: 'Новая гарантия',
            description: '',
          })}
          renderItem={(item, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <TextField label="ID" value={item.id} onChange={(v) => set({ ...item, id: v })} />
                <TextField
                  label="Иконка (emoji)"
                  value={item.icon}
                  onChange={(v) => set({ ...item, icon: v })}
                />
                <TextField
                  label="Заголовок"
                  value={item.title}
                  onChange={(v) => set({ ...item, title: v })}
                />
              </div>
              <TextArea
                label="Описание"
                value={item.description}
                onChange={(v) => set({ ...item, description: v })}
                rows={3}
              />
            </div>
          )}
        />
      </FieldGroup>

      <FieldGroup
        title="Города"
        description="По одному городу на строку. Показываются плашками."
      >
        <TextArea
          label="Список городов"
          value={(g.cities || []).join('\n')}
          onChange={(v) => update(['geography', 'cities'], v.split('\n').map((s) => s.trim()).filter(Boolean))}
          rows={8}
        />
      </FieldGroup>
    </>
  )
}

function FaqTab({ content, update }) {
  const f = content.faq || {}
  return (
    <>
      <FieldGroup title="Раздел FAQ">
        <TextField
          label="Надзаголовок (eyebrow)"
          value={f.eyebrow}
          onChange={(v) => update(['faq', 'eyebrow'], v)}
        />
        <TextField
          label="Заголовок"
          value={f.heading}
          onChange={(v) => update(['faq', 'heading'], v)}
        />
        <TextArea
          label="Описание"
          value={f.description}
          onChange={(v) => update(['faq', 'description'], v)}
          rows={3}
        />
      </FieldGroup>

      <FieldGroup title="Вопросы и ответы">
        <ListEditor
          label="Список"
          items={f.items || []}
          onChange={(v) => update(['faq', 'items'], v)}
          makeNew={() => ({
            id: `q-${Date.now()}`,
            question: 'Новый вопрос?',
            answer: '',
          })}
          renderItem={(item, set) => (
            <div className="space-y-3">
              <TextField label="ID" value={item.id} onChange={(v) => set({ ...item, id: v })} />
              <TextField
                label="Вопрос"
                value={item.question}
                onChange={(v) => set({ ...item, question: v })}
              />
              <TextArea
                label="Ответ"
                value={item.answer}
                onChange={(v) => set({ ...item, answer: v })}
                rows={4}
              />
            </div>
          )}
        />
      </FieldGroup>
    </>
  )
}

function RentTab({ content, update }) {
  const rent = content.rent || {}
  return (
    <>
      <FieldGroup title="Раздел «Аренда техники»">
        <TextField
          label="Заголовок раздела"
          value={rent.heading}
          onChange={(v) => update(['rent', 'heading'], v)}
        />
        <TextArea
          label="Описание раздела"
          value={rent.description}
          onChange={(v) => update(['rent', 'description'], v)}
          rows={3}
        />
        <TextField
          label="Надзаголовок над плитками категорий"
          value={rent.categoriesEyebrow}
          onChange={(v) => update(['rent', 'categoriesEyebrow'], v)}
          hint="Например: «Главные разделы» — как на главной над 4 квадратными карточками"
        />
        <TextField
          label="Бейдж на карточке категории"
          value={rent.categoryBadge}
          onChange={(v) => update(['rent', 'categoryBadge'], v)}
          hint="Короткий текст в углу плитки, обычно «Аренда»"
        />
      </FieldGroup>

      <FieldGroup
        title="Категории и техника"
        description="Каждая категория — квадратная плитка с фото; по клику открывается каталог техники ниже. Можно добавлять новые категории и машины."
      >
        <ListEditor
          label="Категории техники"
          items={rent.categories || []}
          onChange={(v) => update(['rent', 'categories'], v)}
          makeNew={() => ({
            id: `cat-${Date.now()}`,
            title: 'Новая категория',
            shortDescription: '',
            images: [],
            imageUrl: '',
            machines: [],
          })}
          renderItem={(cat, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField label="ID (slug)" value={cat.id} onChange={(v) => set({ ...cat, id: v })} />
                <TextField label="Название" value={cat.title} onChange={(v) => set({ ...cat, title: v })} />
              </div>
              <TextArea
                label="Короткое описание"
                value={cat.shortDescription}
                onChange={(v) => set({ ...cat, shortDescription: v })}
                rows={2}
              />
              <ImagesListField
                label="Галерея для плитки категории"
                value={cat.images}
                onChange={(v) => set({ ...cat, images: v })}
                hint="Несколько фото — коллаж на плитке. Если список пуст — одно фото ниже."
              />
              <ImageField
                label="Одно фото (если галерея пуста)"
                value={cat.imageUrl}
                onChange={(v) => set({ ...cat, imageUrl: v })}
                hint="Квадрат 800×800 или больше"
              />
              <ListEditor
                label="Техника в категории"
                items={cat.machines || []}
                onChange={(v) => set({ ...cat, machines: v })}
                makeNew={() => ({
                  id: `m-${Date.now()}`,
                  name: 'Новая модель',
                  subtitle: '',
                  description: '',
                  images: [],
                  imageUrl: '',
                  prices: [],
                  pricePerDay: '',
                  available: true,
                })}
                renderItem={(m, setM) => (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <TextField label="ID" value={m.id} onChange={(v) => setM({ ...m, id: v })} />
                      <TextField label="Название" value={m.name} onChange={(v) => setM({ ...m, name: v })} />
                    </div>
                    <TextField
                      label="Подзаголовок"
                      value={m.subtitle}
                      onChange={(v) => setM({ ...m, subtitle: v })}
                    />
                    <TextArea
                      label="Описание"
                      value={m.description}
                      onChange={(v) => setM({ ...m, description: v })}
                      rows={3}
                    />
                    <ImagesListField
                      label="Галерея фото"
                      value={m.images}
                      onChange={(v) => setM({ ...m, images: v })}
                      hint="Несколько фото в карточке. Если список пуст — одно фото ниже."
                    />
                    <ImageField
                      label="Одно фото (если галерея пуста)"
                      value={m.imageUrl}
                      onChange={(v) => setM({ ...m, imageUrl: v })}
                    />
                    <ListEditor
                      label="Тарифы / цены"
                      hint="Например: «Сутки», «Неделя», «С оператором». На сайте показывается таблица; если список пуст — используется одно поле «Цена за сутки» ниже."
                      items={m.prices || []}
                      onChange={(v) => setM({ ...m, prices: v })}
                      makeNew={() => ({
                        id: `price-${Date.now()}`,
                        label: 'За сутки',
                        value: '',
                      })}
                      renderItem={(row, setRow) => (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <TextField
                            label="Подпись (период, условие)"
                            value={row.label}
                            onChange={(v) => setRow({ ...row, label: v })}
                            placeholder="Сутки / Неделя / Час"
                          />
                          <TextField
                            label="Цена (как на сайте)"
                            value={row.value}
                            onChange={(v) => setRow({ ...row, value: v })}
                            placeholder="25 000 ₸"
                          />
                        </div>
                      )}
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <TextField
                        label="Цена за сутки (если список тарифов пуст)"
                        value={m.pricePerDay}
                        onChange={(v) => setM({ ...m, pricePerDay: v })}
                        placeholder="например, 25 000 ₸"
                        hint="Запасной вариант одной строкой"
                      />
                      <CheckboxField
                        label="В наличии"
                        value={m.available !== false}
                        onChange={(v) => setM({ ...m, available: v })}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        />
      </FieldGroup>
    </>
  )
}

function SocialTab({ content, update }) {
  const s = content.social || {}
  return (
    <FieldGroup title="Соцсети">
      <TextField label="Заголовок раздела" value={s.heading} onChange={(v) => update(['social', 'heading'], v)} />
      <TextArea
        label="Текст про Instagram"
        value={s.instagramText}
        onChange={(v) => update(['social', 'instagramText'], v)}
        rows={2}
      />
      <TextArea
        label="Текст про TikTok"
        value={s.tiktokText}
        onChange={(v) => update(['social', 'tiktokText'], v)}
        rows={2}
      />
      <TextField
        label="Ссылка на YouTube"
        value={s.youtubeUrl}
        onChange={(v) => update(['social', 'youtubeUrl'], v)}
      />
      <TextArea
        label="Текст про YouTube"
        value={s.youtubeText}
        onChange={(v) => update(['social', 'youtubeText'], v)}
        rows={2}
      />
    </FieldGroup>
  )
}

function ContactTab({ content, update }) {
  const c = content.contact || {}
  return (
    <>
      <FieldGroup
        title="Карточки на странице «Контакты»"
        description="Список контактов: телефоны, мессенджеры, соцсети, адрес. Пустой список — показываются одиночные поля из блока «Запасные поля» ниже."
      >
        <ListEditor
          label="Контакты"
          items={c.links || []}
          onChange={(v) => update(['contact', 'links'], v)}
          makeNew={() => ({
            id: `cl-${Date.now()}`,
            label: 'Телефон',
            text: '',
            href: '',
            icon: '📞',
          })}
          renderItem={(item, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <TextField label="ID" value={item.id} onChange={(v) => set({ ...item, id: v })} />
                <TextField
                  label="Подпись (Телефон, WhatsApp, Telegram…)"
                  value={item.label}
                  onChange={(v) => set({ ...item, label: v })}
                />
              </div>
              <TextField
                label="Текст на карточке"
                value={item.text}
                onChange={(v) => set({ ...item, text: v })}
                hint="Номер, email, ник или короткая подпись кнопки"
              />
              <TextField
                label="Ссылка"
                value={item.href}
                onChange={(v) => set({ ...item, href: v })}
                hint="tel:+7…, mailto:…, https://wa.me/…, https://t.me/… — пусто = только текст (например адрес)"
              />
              <TextField
                label="Иконка (emoji)"
                value={item.icon}
                onChange={(v) => set({ ...item, icon: v })}
              />
            </div>
          )}
        />
      </FieldGroup>

      <FieldGroup
        title="Запасные поля и интеграции"
        description="Используются, если список карточек пуст; также для блока «Соцсети», футера и кнопок аренды (WhatsApp)."
      >
        <TextField label="Телефон (как показывать)" value={c.phone} onChange={(v) => update(['contact', 'phone'], v)} />
        <TextField
          label="Телефон (только цифры, без +)"
          value={c.phoneDigits}
          onChange={(v) => update(['contact', 'phoneDigits'], v)}
          hint="Ссылки WhatsApp в разделе аренды"
        />
        <TextField
          label="WhatsApp URL"
          value={c.whatsappUrl}
          onChange={(v) => update(['contact', 'whatsappUrl'], v)}
          hint="https://wa.me/77757147712"
        />
        <TextField
          label="Шаблон сообщения в WhatsApp (аренда)"
          value={c.whatsappText}
          onChange={(v) => update(['contact', 'whatsappText'], v)}
          hint="К шаблону добавляется название модели техники"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField
            label="Instagram URL"
            value={c.instagramUrl}
            onChange={(v) => update(['contact', 'instagramUrl'], v)}
          />
          <TextField
            label="Instagram handle"
            value={c.instagramHandle}
            onChange={(v) => update(['contact', 'instagramHandle'], v)}
          />
          <TextField
            label="TikTok URL"
            value={c.tiktokUrl}
            onChange={(v) => update(['contact', 'tiktokUrl'], v)}
          />
          <TextField
            label="TikTok handle"
            value={c.tiktokHandle}
            onChange={(v) => update(['contact', 'tiktokHandle'], v)}
          />
        </div>
        <TextField label="Email" value={c.email} onChange={(v) => update(['contact', 'email'], v)} />
        <TextField label="Адрес" value={c.address} onChange={(v) => update(['contact', 'address'], v)} />
        <TextField
          label="Часы работы / подзаголовок блока"
          value={c.workingHours}
          onChange={(v) => update(['contact', 'workingHours'], v)}
        />
      </FieldGroup>
    </>
  )
}

function FooterTab({ content, update }) {
  const f = content.footer || {}
  return (
    <FieldGroup title="Подвал">
      <TextField label="Слоган в подвале" value={f.tagline} onChange={(v) => update(['footer', 'tagline'], v)} />
      <TextField label="Копирайт" value={f.copyright} onChange={(v) => update(['footer', 'copyright'], v)} />
      <CheckboxField
        label="Показывать ссылку на политику конфиденциальности"
        value={f.showPrivacyLink}
        onChange={(v) => update(['footer', 'showPrivacyLink'], v)}
      />
      {f.showPrivacyLink && (
        <TextField
          label="Ссылка на политику"
          value={f.privacyHref}
          onChange={(v) => update(['footer', 'privacyHref'], v)}
        />
      )}
    </FieldGroup>
  )
}

const BLOCK_TYPES = [
  { id: 'hero', label: 'Hero (главный экран)' },
  { id: 'about', label: 'О компании' },
  { id: 'cleaning', label: 'Услуги (категории)' },
  { id: 'industries', label: 'Отраслевые решения' },
  { id: 'technology', label: 'Технологии и стандарты' },
  { id: 'equipment', label: 'Оборудование' },
  { id: 'geography', label: 'География и гарантии' },
  { id: 'faq', label: 'FAQ' },
  { id: 'rent', label: 'Аренда техники' },
  { id: 'social', label: 'Соцсети' },
  { id: 'contact', label: 'Контакты' },
  { id: 'custom', label: 'Свой раздел (текст, фото, галерея)' },
]

function PagesTab({ content, update }) {
  const pages = content.pages || []
  return (
    <FieldGroup
      title="Страницы и свои разделы"
      description="Добавляйте новые секции с текстом и фотографиями без программиста: выберите страницу → «+ добавить» в блоках → тип «Свой раздел». Готовые блоки (Hero, Аренда…) настраиваются на отдельных вкладках админки."
    >
      <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/[0.07] p-4 text-sm text-slate-200 space-y-2 mb-6">
        <p className="font-medium text-cyan-200">Как заказчику добавить раздел с фото</p>
        <ol className="list-decimal list-inside space-y-1 text-slate-300">
          <li>
            Ниже откройте нужную страницу (например «Главная») и в списке «Блоки страницы» нажмите{' '}
            <strong className="text-slate-100">+ добавить</strong>.
          </li>
          <li>
            Выберите тип <strong className="text-slate-100">Свой раздел</strong> — откроется форма: заголовок,
            текст, одна картинка или галерея, кнопка, расположение.
          </li>
          <li>
            Задайте <strong className="text-slate-100">ID блока (якорь)</strong> латиницей без пробелов — тогда
            можно ссылаться из шапки, например <code className="text-cyan-300">/#portfolio</code>.
          </li>
          <li>
            Чтобы сделать новую страницу целиком: «+ добавить» в списке страниц, укажите URL и блоки — ссылку
            добавьте в шапку на вкладке «Шапка».
          </li>
        </ol>
      </div>
      <ListEditor
        label="Страницы"
        items={pages}
        onChange={(v) => update(['pages'], v)}
        makeNew={() => ({
          id: `page-${Date.now()}`,
          slug: '/new-page',
          title: 'Новая страница',
          seo: {
            title: '',
            description: '',
            keywords: '',
            images: [],
            imageUrl: '',
            imageAlt: '',
            ogType: '',
            articlePublishedTime: '',
            articleModifiedTime: '',
            sitemapLastmod: '',
            sitemapChangefreq: '',
            sitemapPriority: '',
            noIndex: false,
          },
          blocks: [],
        })}
        renderItem={(page, set) => (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <TextField label="ID" value={page.id} onChange={(v) => set({ ...page, id: v })} />
              <TextField label="URL (slug)" value={page.slug} onChange={(v) => set({ ...page, slug: v })} />
              <TextField label="Название" value={page.title} onChange={(v) => set({ ...page, title: v })} />
            </div>
            <details className="rounded-xl border border-white/10 bg-black/20 p-4">
              <summary className="cursor-pointer text-sm text-cyan-300">SEO для этой страницы</summary>
              <div className="mt-3 space-y-3">
                <TextField
                  label="Title"
                  value={page.seo?.title}
                  onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), title: v } })}
                />
                <TextArea
                  label="Description"
                  value={page.seo?.description}
                  onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), description: v } })}
                  rows={3}
                />
                <TextField
                  label="Keywords"
                  value={page.seo?.keywords}
                  onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), keywords: v } })}
                />
                <ImagesListField
                  label="OG-изображения (галерея)"
                  value={page.seo?.images}
                  onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), images: v } })}
                  hint="Для meta og:image используется первое фото. Ниже — запасной вариант одной картинки."
                />
                <ImageField
                  label="Одна OG-картинка (если галерея пуста)"
                  value={page.seo?.imageUrl}
                  onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), imageUrl: v } })}
                />
                <TextField
                  label="Alt OG-картинки"
                  value={page.seo?.imageAlt}
                  onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), imageAlt: v } })}
                />
                <label className="block">
                  <div className="text-sm text-slate-300">Open Graph type</div>
                  <select
                    value={page.seo?.ogType || ''}
                    onChange={(e) =>
                      set({ ...page, seo: { ...(page.seo || {}), ogType: e.target.value } })
                    }
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2 text-white"
                  >
                    {OG_TYPES.map((o) => (
                      <option key={o.value || 'default'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextField
                    label="article:published_time (ISO)"
                    value={page.seo?.articlePublishedTime}
                    onChange={(v) =>
                      set({ ...page, seo: { ...(page.seo || {}), articlePublishedTime: v } })
                    }
                    hint="Если og:type = article"
                  />
                  <TextField
                    label="article:modified_time (ISO)"
                    value={page.seo?.articleModifiedTime}
                    onChange={(v) =>
                      set({ ...page, seo: { ...(page.seo || {}), articleModifiedTime: v } })
                    }
                  />
                </div>
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Sitemap.xml</div>
                  <TextField
                    label="lastmod (дата изменения)"
                    value={page.seo?.sitemapLastmod}
                    onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), sitemapLastmod: v } })}
                    hint="Например 2026-05-10 или полная ISO-дата"
                  />
                  <label className="block">
                    <div className="text-sm text-slate-300">changefreq</div>
                    <select
                      value={page.seo?.sitemapChangefreq || ''}
                      onChange={(e) =>
                        set({ ...page, seo: { ...(page.seo || {}), sitemapChangefreq: e.target.value } })
                      }
                      className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2 text-white"
                    >
                      {SITEMAP_FREQ.map((o) => (
                        <option key={o.value || 'w'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextField
                    label="priority (0–1)"
                    value={page.seo?.sitemapPriority}
                    onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), sitemapPriority: v } })}
                    hint="Главная часто 1.0, внутренние 0.8"
                  />
                </div>
                <CheckboxField
                  label="Скрыть от поисковиков (noindex)"
                  value={page.seo?.noIndex}
                  onChange={(v) => set({ ...page, seo: { ...(page.seo || {}), noIndex: v } })}
                />
              </div>
            </details>
            <ListEditor
              label="Блоки страницы"
              hint="Каждый блок соответствует одной секции на сайте. Можно отключить или поменять порядок."
              items={page.blocks || []}
              onChange={(v) => set({ ...page, blocks: v })}
              makeNew={() => ({
                id: `section-${Date.now()}`,
                type: 'custom',
                enabled: true,
                data: { layout: 'left' },
              })}
              renderItem={(block, setBlock) => (
                <div className="space-y-3">
                  <TextField
                    label="ID блока (якорь для ссылки)"
                    value={block.id}
                    onChange={(v) => setBlock({ ...block, id: v })}
                    hint="Латиницей, без пробелов: portfolio, akcii. В меню ссылка: /#portfolio или /about#portfolio"
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="block">
                      <div className="text-sm text-slate-300">Тип блока</div>
                      <select
                        value={block.type}
                        onChange={(e) => setBlock({ ...block, type: e.target.value })}
                        className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2 text-white"
                      >
                        {BLOCK_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <CheckboxField
                      label="Блок включён"
                      value={block.enabled !== false}
                      onChange={(v) => setBlock({ ...block, enabled: v })}
                    />
                  </div>
                  {block.type === 'custom' && (
                    <details open className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <summary className="cursor-pointer text-sm text-cyan-300">
                        Текст, фото и кнопка (свой раздел)
                      </summary>
                      <div className="mt-3 space-y-3">
                        <TextField
                          label="Заголовок"
                          value={block.data?.title}
                          onChange={(v) =>
                            setBlock({ ...block, data: { ...(block.data || {}), title: v } })
                          }
                        />
                        <TextField
                          label="Надзаголовок"
                          value={block.data?.subtitle}
                          onChange={(v) =>
                            setBlock({ ...block, data: { ...(block.data || {}), subtitle: v } })
                          }
                        />
                        <TextArea
                          label="Текст (HTML разрешён)"
                          value={block.data?.body}
                          onChange={(v) =>
                            setBlock({ ...block, data: { ...(block.data || {}), body: v } })
                          }
                          rows={5}
                        />
                        <ImagesListField
                          label="Галерея изображений"
                          value={block.data?.images}
                          onChange={(v) =>
                            setBlock({ ...block, data: { ...(block.data || {}), images: v } })
                          }
                          hint="Если список пуст — одна картинка ниже."
                        />
                        <ImageField
                          label="Одна картинка (если галерея пуста)"
                          value={block.data?.imageUrl}
                          onChange={(v) =>
                            setBlock({ ...block, data: { ...(block.data || {}), imageUrl: v } })
                          }
                        />
                        <TextField
                          label="Подпись к одной картинке (alt)"
                          value={block.data?.imageAlt}
                          onChange={(v) =>
                            setBlock({ ...block, data: { ...(block.data || {}), imageAlt: v } })
                          }
                        />
                        <div className="grid sm:grid-cols-2 gap-3">
                          <TextField
                            label="Текст кнопки"
                            value={block.data?.ctaText}
                            onChange={(v) =>
                              setBlock({ ...block, data: { ...(block.data || {}), ctaText: v } })
                            }
                          />
                          <TextField
                            label="Ссылка кнопки"
                            value={block.data?.ctaHref}
                            onChange={(v) =>
                              setBlock({ ...block, data: { ...(block.data || {}), ctaHref: v } })
                            }
                          />
                        </div>
                        <label className="block">
                          <div className="text-sm text-slate-300">Расположение картинки</div>
                          <select
                            value={block.data?.layout || 'left'}
                            onChange={(e) =>
                              setBlock({ ...block, data: { ...(block.data || {}), layout: e.target.value } })
                            }
                            className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-3 py-2 text-white"
                          >
                            <option value="left">Картинка справа, текст слева</option>
                            <option value="right">Картинка слева, текст справа</option>
                            <option value="center">По центру, без колонки с картинкой</option>
                            <option value="gallery">Галерея фото (сетка, можно только картинки)</option>
                          </select>
                        </label>
                      </div>
                    </details>
                  )}
                </div>
              )}
            />
          </div>
        )}
      />
    </FieldGroup>
  )
}
