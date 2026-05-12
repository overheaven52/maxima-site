import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

/** Общий блок: заголовок, подзаголовок, CTA, галерея — для HomeHeroLeadSection и десктопного героя. */
export default function HomeHeroLeadInner({ className = '', showEyebrow = true }) {
  const hero = useContent().hero || {}

  const hasText =
    hero.title ||
    hero.titleHighlight ||
    hero.subtitle ||
    hero.primaryButton?.text ||
    hasContentImages(hero)

  if (!hasText) return null

  return (
    <div className={`section-fade ${className}`.trim()}>
      {showEyebrow && hero.eyebrow && (
        <p className="mb-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-cyan-200/90 sm:text-xs px-3 py-1.5 rounded-full border border-white/15 bg-black/30 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden />
          {hero.eyebrow}
        </p>
      )}
      {(hero.title || hero.titleHighlight) && (
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-extrabold leading-tight">
          <span className="text-white">{hero.title}</span>{' '}
          <span className="neon-text">{hero.titleHighlight}</span>
        </h1>
      )}
      {hero.subtitle && (
        <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-200/90 max-w-2xl leading-relaxed lg:max-w-none">
          {hero.subtitle}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {hero.primaryButton?.text && (
          <a
            href={hero.primaryButton.href || '#'}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 shadow-[0_0_30px_-10px_rgba(34,211,238,0.55)] transition"
          >
            {hero.primaryButton.text}
          </a>
        )}
      </div>

      {hasContentImages(hero) && (
        <div className="mt-8 max-w-2xl lg:max-w-none">
          <MediaGallery entity={hero} fallbackAlt={hero.imageAlt || ''} variant="strip" />
        </div>
      )}
    </div>
  )
}
