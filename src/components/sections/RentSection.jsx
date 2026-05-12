import { useState, useEffect, useCallback, useRef } from 'react'
import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import HeroStatsStrip from './HeroStatsStrip.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

/** Список тарифов из prices[] или запасной вариант pricePerDay */
function getRentMachinePriceRows(m) {
  const raw = m?.prices
  if (Array.isArray(raw) && raw.length > 0) {
    const rows = []
    for (let i = 0; i < raw.length; i++) {
      const p = raw[i]
      if (!p) continue
      const label = String(p.label ?? '').trim()
      const value = String(p.value ?? p.amount ?? '').trim()
      if (!label && !value) continue
      rows.push({
        id: String(p.id || `p-${i}`),
        label: label || 'Тариф',
        value: value || '—',
      })
    }
    if (rows.length > 0) return rows
  }
  const legacy = String(m?.pricePerDay ?? '').trim()
  if (legacy) return [{ id: 'per-day', label: 'За сутки', value: legacy }]
  return []
}

export default function RentSection() {
  const content = useContent()
  const rent = content.rent || {}
  const contact = content.contact || {}
  const categories = rent.categories || []
  const eyebrow = rent.categoriesEyebrow || 'Главные разделы'
  const badgeText = rent.categoryBadge || 'Аренда'

  const [openCategoryId, setOpenCategoryId] = useState(null)
  const categoryPanelRef = useRef(null)

  useEffect(() => {
    setOpenCategoryId((prev) =>
      prev && categories.some((c) => c.id === prev) ? prev : null,
    )
  }, [categories])

  const current = categories.find((c) => c.id === openCategoryId)

  const closeCategory = useCallback(() => setOpenCategoryId(null), [])

  useEffect(() => {
    if (!openCategoryId) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeCategory()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openCategoryId, closeCategory])

  useEffect(() => {
    if (!openCategoryId) return
    const id = requestAnimationFrame(() => {
      categoryPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(id)
  }, [openCategoryId])

  function buildWaUrl(machineName) {
    const phone = contact.phoneDigits || '77757147712'
    const text = `${contact.whatsappText || 'Здравствуйте, интересует аренда'} ${machineName}`
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }

  return (
    <section
      id="rent"
      className="relative scroll-mt-16 sm:scroll-mt-20 pt-0 pb-10 sm:pt-8 sm:pb-20 md:pt-12 md:pb-28"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight sm:leading-[1.1] tracking-tight text-white">
            {rent.heading}
          </h2>
          {rent.description && (
            <p className="mt-1.5 sm:mt-4 text-xs sm:text-base md:text-lg text-slate-200/90 leading-snug sm:leading-relaxed max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
              {rent.description}
            </p>
          )}
        </div>

        {categories.length > 0 && !openCategoryId && (
          <>
            <p className="mt-2.5 sm:mt-9 md:mt-12 text-center text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-300 font-medium">
              {eyebrow}
            </p>
            {/* Мобилка: низкие карточки 3:2, узкие зазоры — 2×2 влезает в экран вместе с героем */}
            <div className="mt-2 sm:mt-6 md:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setOpenCategoryId(c.id)}
                  className="group relative aspect-[3/2] sm:aspect-[6/5] md:aspect-square rounded-lg sm:rounded-2xl overflow-hidden border text-left transition-all duration-200 border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)] sm:hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06152d] touch-manip active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-[#0b1d3a] overflow-hidden">
                    {hasContentImages(c) ? (
                      <div className="h-full w-full transition duration-300 sm:group-hover:scale-105 [&_img]:transition [&_img]:duration-300 sm:group-hover:[&_img]:scale-105">
                        <MediaGallery entity={c} fallbackAlt={c.title} variant="square" />
                      </div>
                    ) : (
                      <div className="h-full w-full grid place-items-center text-2xl sm:text-5xl bg-gradient-to-br from-[#0b1d3a] to-[#06152d]">
                        🛠️
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06152d]/95 via-[#06152d]/35 to-transparent" />
                  <div className="absolute top-1 left-1 sm:top-3 sm:left-3">
                    <span className="inline-block text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wide px-1 py-px sm:px-2 sm:py-1 rounded sm:rounded-md bg-cyan-400/90 text-[#06152d] font-semibold">
                      {badgeText}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 sm:p-3 md:p-4">
                    <h3 className="text-[10px] sm:text-sm md:text-lg font-bold text-white leading-tight sm:leading-snug drop-shadow-md line-clamp-2 sm:line-clamp-none">
                      {c.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
            <HeroStatsStrip className="mt-4 sm:mt-10 md:mt-12" compactMobile />
          </>
        )}

        {current && openCategoryId && (
          <div
            ref={categoryPanelRef}
            className="mt-10 md:mt-14 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden scroll-mt-24"
            role="region"
            aria-label={current.title}
          >
            <div className="relative">
              <div className="relative h-40 sm:h-48 md:h-56 bg-[#0b1d3a] overflow-hidden">
                {hasContentImages(current) ? (
                  <MediaGallery entity={current} fallbackAlt={current.title} variant="banner" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-6xl bg-gradient-to-br from-[#0b1d3a] to-[#06152d]">
                    🛠️
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06152d] via-[#06152d]/70 to-[#06152d]/20" />
              </div>

              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={closeCategory}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[#06152d]/85 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:border-cyan-400/50 hover:bg-[#06152d]/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <span className="text-lg leading-none" aria-hidden>
                    ←
                  </span>
                  К главным разделам
                </button>
                <span className="inline-block text-[10px] sm:text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-cyan-400/90 text-[#06152d] font-semibold">
                  {badgeText}
                </span>
              </div>

              <div className="px-5 pb-2 pt-6 sm:px-8 sm:pb-3 sm:pt-8 md:px-10">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-cyan-300/70 mb-2">
                  {eyebrow}
                </p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {current.title}
                </h3>
                {current.shortDescription && (
                  <p className="mt-3 text-slate-300/90 max-w-3xl leading-relaxed">
                    {current.shortDescription}
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 pb-8 sm:px-8 md:px-10 md:pb-10">
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                {(current.machines || []).map((m) => {
                  const priceRows = getRentMachinePriceRows(m)
                  return (
                  <article
                    key={m.id}
                    className="neon-card rounded-2xl border border-white/10 bg-white/[0.04] p-5 flex flex-col"
                  >
                    <div className="aspect-square rounded-xl bg-[#0b1d3a] border border-white/10 mb-4 overflow-hidden grid place-items-center">
                      {hasContentImages(m) ? (
                        <MediaGallery entity={m} fallbackAlt={m.name} variant="square" />
                      ) : (
                        <span className="text-5xl">🛠️</span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-white">{m.name}</h4>
                    {m.subtitle && (
                      <p className="mt-1 text-sm text-cyan-300/80">{m.subtitle}</p>
                    )}
                    {m.description && (
                      <p className="mt-3 text-sm text-slate-300/90 leading-relaxed flex-1">
                        {m.description}
                      </p>
                    )}
                    {priceRows.length > 0 && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                          Стоимость аренды
                        </div>
                        <ul className="space-y-1.5 text-sm">
                          {priceRows.map((row) => (
                            <li
                              key={row.id}
                              className="flex justify-between gap-3 text-slate-300 leading-snug"
                            >
                              <span className="text-slate-400 shrink-0">{row.label}</span>
                              <span className="text-cyan-300 font-semibold text-right">{row.value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a
                      href={buildWaUrl(m.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 transition"
                    >
                      Арендовать
                    </a>
                  </article>
                  )
                })}
              </div>

              <div className="mt-8 flex justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={closeCategory}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <span aria-hidden>←</span>
                  Вернуться к разделам
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
