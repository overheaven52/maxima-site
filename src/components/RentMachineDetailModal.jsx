import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getRentMachineModalImages } from '../utils/contentImages.js'
import { useLocale, UI_STRINGS } from '../i18n/LocaleContext.jsx'

/** Список тарифов из prices[] или pricePerDay — дублируем логику RentSection */
function getRentMachinePriceRows(m, tariffFallback, perDayLabel) {
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
        label: label || tariffFallback,
        value: value || '—',
      })
    }
    if (rows.length > 0) return rows
  }
  const legacy = String(m?.pricePerDay ?? '').trim()
  if (legacy) return [{ id: 'per-day', label: perDayLabel, value: legacy }]
  return []
}

export function normalizeMachineDetail(m, specParamFallback) {
  const d = m?.detail && typeof m.detail === 'object' ? m.detail : {}
  const rawSpecs = d.specs
  const specRows = []
  if (Array.isArray(rawSpecs)) {
    for (let i = 0; i < rawSpecs.length; i++) {
      const p = rawSpecs[i]
      if (!p) continue
      const label = String(p.label ?? '').trim()
      const value = String(p.value ?? p.amount ?? '').trim()
      if (!label && !value) continue
      specRows.push({
        id: String(p.id || `spec-${i}`),
        label: label || specParamFallback,
        value: value || '—',
      })
    }
  }
  return {
    forWork: String(d.forWork ?? '').trim(),
    forWhom: String(d.forWhom ?? '').trim(),
    howItWorks: String(d.howItWorks ?? '').trim(),
    coverage: String(d.coverage ?? '').trim(),
    capabilities: String(d.capabilities ?? '').trim(),
    dimensions: String(d.dimensions ?? '').trim(),
    notes: String(d.notes ?? '').trim(),
    specRows,
  }
}

export default function RentMachineDetailModal({
  machine,
  categoryTitle,
  badgeText,
  waHref,
  onClose,
}) {
  const { locale } = useLocale()
  const ui = useMemo(() => UI_STRINGS[locale] || UI_STRINGS.ru, [locale])
  const SECTIONS = useMemo(
    () => [
      { key: 'forWork', label: ui.rentSecForWork, icon: '🎯' },
      { key: 'forWhom', label: ui.rentSecForWhom, icon: '👥' },
      { key: 'coverage', label: ui.rentSecCoverage, icon: '📐' },
      { key: 'capabilities', label: ui.rentSecCapabilities, icon: '✨' },
      { key: 'howItWorks', label: ui.rentSecHowItWorks, icon: '⚙️' },
      { key: 'dimensions', label: ui.rentSecDimensions, icon: '📏' },
      { key: 'notes', label: ui.rentSecNotes, icon: '📌' },
    ],
    [ui],
  )

  const panelRef = useRef(null)
  const detail = machine ? normalizeMachineDetail(machine, ui.rentSpecParam) : {}
  const specRows = detail.specRows || []
  const priceRows = machine
    ? getRentMachinePriceRows(machine, ui.rentTariffFallback, ui.rentPerDay)
    : []
  const galleryImages = machine ? getRentMachineModalImages(machine) : []
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef(null)

  useEffect(() => {
    setSlide(0)
  }, [machine?.id])

  const slideCount = galleryImages.length
  const goPrev = useCallback(() => {
    if (slideCount <= 1) return
    setSlide((s) => (s - 1 + slideCount) % slideCount)
  }, [slideCount])
  const goNext = useCallback(() => {
    if (slideCount <= 1) return
    setSlide((s) => (s + 1) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (!machine) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [machine])

  useEffect(() => {
    if (!machine) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [machine, onClose, goPrev, goNext])

  useEffect(() => {
    if (!machine) return
    const t = requestAnimationFrame(() => {
      panelRef.current?.focus()
    })
    return () => cancelAnimationFrame(t)
  }, [machine])

  if (!machine || typeof document === 'undefined') return null

  const filledSections = SECTIONS.filter((s) => detail[s.key])
  const hasTextSections = filledSections.length > 0
  const hasAnyDetail = hasTextSections || specRows.length > 0

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm transition-opacity"
        aria-label={ui.rentCloseBackdrop}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rent-machine-detail-title"
        tabIndex={-1}
        className="relative w-full sm:max-w-2xl lg:max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-white/15 bg-gradient-to-b from-[#0f172a] to-[#06152d] shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden"
      >
        {/* Шапка: без перекрытия текста с фото — заголовок ниже, в скролле */}
        <div className="relative shrink-0 bg-gradient-to-b from-[#0f2238] via-[#0b1a32] to-[#06152d] px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-5 border-b border-white/[0.07]">
          <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-400/90 text-[#06152d] font-semibold shrink-0">
              {badgeText}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 grid place-items-center w-10 h-10 rounded-xl border border-white/20 bg-[#06152d]/85 backdrop-blur-sm text-white text-xl leading-none hover:border-cyan-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label={ui.rentCloseModal}
            >
              ×
            </button>
          </div>

          <div className="relative w-full max-w-full">
            {/* Карусель: несколько фото, листание вбок (кнопки, свайп, стрелки клавиатуры) */}
            <div className="rounded-2xl border border-white/[0.12] bg-gradient-to-b from-slate-300/[0.12] via-slate-500/[0.05] to-transparent p-2 sm:p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/20">
              {galleryImages.length > 0 ? (
                <div
                  className="relative overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.98] to-slate-100/[0.9] shadow-inner min-h-[11.5rem] sm:min-h-[15rem] lg:min-h-[17rem] select-none touch-pan-x"
                  onTouchStart={(e) => {
                    touchStartX.current = e.touches[0]?.clientX ?? null
                  }}
                  onTouchEnd={(e) => {
                    const start = touchStartX.current
                    touchStartX.current = null
                    if (start == null || slideCount <= 1) return
                    const end = e.changedTouches[0]?.clientX
                    if (end == null) return
                    const dx = end - start
                    if (dx > 48) goPrev()
                    else if (dx < -48) goNext()
                  }}
                >
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${slide * 100}%)` }}
                  >
                    {galleryImages.map((img, i) => (
                      <div
                        key={`${img.url}-${i}`}
                        className="min-w-full shrink-0 flex items-center justify-center px-1 py-2 sm:px-2 sm:py-3"
                      >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full max-w-full h-auto max-h-[min(38vh,15.5rem)] sm:max-h-[min(36vh,19rem)] lg:max-h-[min(34vh,21rem)] object-contain object-center pointer-events-none"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                  {slideCount > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-xl border border-white/25 bg-[#06152d]/80 text-white text-xl leading-none shadow-lg backdrop-blur-sm hover:border-cyan-400/50 hover:bg-[#06152d] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        aria-label={ui.rentCarouselPrev}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-xl border border-white/25 bg-[#06152d]/80 text-white text-xl leading-none shadow-lg backdrop-blur-sm hover:border-cyan-400/50 hover:bg-[#06152d] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                        aria-label={ui.rentCarouselNext}
                      >
                        ›
                      </button>
                      <div
                        className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2"
                        role="tablist"
                        aria-label={ui.rentCarouselDots}
                      >
                        {galleryImages.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            role="tab"
                            aria-selected={i === slide}
                            aria-label={`${ui.rentCarouselPhotoN} ${i + 1} / ${slideCount}`}
                            onClick={() => setSlide(i)}
                            className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                              i === slide ? 'w-6 bg-cyan-400' : 'w-2 bg-white/45 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-800/60 grid place-items-center min-h-[11.5rem] sm:min-h-[15rem] text-5xl sm:text-6xl">
                  🛠️
                </div>
              )}
            </div>
            {/* Лёгкое свечение под блоком фото */}
            <div
              className="pointer-events-none absolute -inset-x-4 -bottom-2 h-16 bg-gradient-to-t from-cyan-400/[0.07] to-transparent blur-xl opacity-90"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
          {categoryTitle && (
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-cyan-300/80 font-medium mb-2">
              {categoryTitle}
            </p>
          )}
          <h2
            id="rent-machine-detail-title"
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug sm:leading-tight break-words text-balance"
          >
            {machine.name}
          </h2>
          {machine.subtitle && (
            <p className="mt-2 text-sm sm:text-base text-cyan-300/90 font-medium leading-snug break-words">
              {machine.subtitle}
            </p>
          )}

          {!hasAnyDetail && (
            <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/5 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-sm text-slate-200/95 leading-relaxed">
                {ui.rentDetailEmpty}
              </p>
            </div>
          )}

          {hasTextSections && (
            <div className="mt-5 space-y-3">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-cyan-300/80 font-semibold px-0.5">
                {ui.rentDetailBlocksTitle}
              </p>
              <div className="space-y-3">
                {filledSections.map((s) => (
                  <div
                    key={s.key}
                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-4 py-3.5 sm:px-5 sm:py-4"
                  >
                    <div className="flex gap-3">
                      <span
                        className="text-2xl shrink-0 w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/20 grid place-items-center"
                        aria-hidden
                      >
                        {s.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5">
                          {s.label}
                        </h3>
                        <p className="text-sm text-slate-300/95 leading-relaxed whitespace-pre-wrap">
                          {detail[s.key]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {specRows.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 mb-3 font-semibold">
                {ui.rentSpecsTitle}
              </p>
              <dl className="space-y-2.5 text-sm">
                {specRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 border-b border-white/[0.06] pb-2.5 last:border-0 last:pb-0"
                  >
                    <dt className="text-slate-400 shrink-0 sm:max-w-[45%]">{row.label}</dt>
                    <dd className="text-slate-100 font-medium text-right sm:text-left min-w-0 break-words">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {priceRows.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                {ui.rentPricesTitle}
              </p>
              <ul className="space-y-2 text-sm">
                {priceRows.map((row) => (
                  <li key={row.id} className="flex justify-between gap-4 text-slate-300">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-cyan-300 font-semibold text-right">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-cyan-400 text-[#06152d] font-semibold text-sm sm:text-base hover:bg-cyan-300 transition shadow-[0_0_24px_rgba(34,211,238,0.25)]"
            >
              {ui.rentWhatsappAsk}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 sm:flex-none items-center justify-center px-5 py-3.5 rounded-xl border border-white/20 bg-white/[0.06] text-slate-200 font-semibold text-sm hover:border-white/35 hover:text-white transition"
            >
              {ui.rentClose}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
