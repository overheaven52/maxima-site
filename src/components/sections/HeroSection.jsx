import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

export default function HeroSection() {
  const content = useContent()
  const hero = content.hero || {}
  const stats = hero.stats || []
  const bgUrl =
    String(hero.backgroundImageUrl || hero.imageUrl || hero.images?.[0]?.url || '').trim()
  const bgAlt = String(hero.backgroundImageAlt || hero.imageAlt || '').trim()
  const bgPos = String(hero.backgroundPosition || '50% 50%').trim() || '50% 50%'
  const bgFit = String(hero.backgroundFit || 'cover').trim() || 'cover'
  const scaleRaw = Number(hero.backgroundScale ?? 1)
  // With object-cover, scale < 1 reveals edges. Clamp to >= 1.
  const bgScale = Number.isFinite(scaleRaw) ? Math.min(1.35, Math.max(1, scaleRaw)) : 1

  return (
    <>
    <section
      id="top"
      className="relative z-0 w-full overflow-hidden min-h-[min(82svh,940px)]"
    >
      {bgUrl && (
        <div className="absolute inset-0 z-0 bg-[#06152d]">
          <img
            src={bgUrl}
            alt={bgAlt}
            className={`w-full h-full ${bgFit === 'contain' ? 'object-contain' : 'object-cover'}`}
            style={{
              objectPosition: bgPos,
              transform: bgScale !== 1 ? `scale(${bgScale})` : undefined,
              transformOrigin: bgPos,
            }}
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
        </div>
      )}
      {/* spacer to keep hero height above bottom bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-10 pb-52 md:pt-14 md:pb-56 min-h-[min(82svh,940px)]">
        <div className="section-fade max-w-3xl">
          {hero.eyebrow && (
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.28em] text-white/85 px-3 py-1.5 rounded-full border border-white/15 bg-black/25 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              {hero.eyebrow}
            </p>
          )}
        </div>
      </div>

      {/* bottom bar like example */}
      <div className="absolute inset-x-0 bottom-5 md:bottom-7 z-30">
        <div className="bg-black/55 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-5 section-fade">
            <div className="max-w-4xl">
              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                <span className="text-white">{hero.title}</span>{' '}
                <span className="neon-text">{hero.titleHighlight}</span>
              </h1>
              {hero.subtitle && (
                <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-200/90 max-w-2xl">
                  {hero.subtitle}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {hero.primaryButton?.text && (
                  <a
                    href={hero.primaryButton.href || '#'}
                    className="inline-flex items-center gap-2 px-5 md:px-6 py-3 rounded-xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 shadow-[0_0_30px_-10px_rgba(34,211,238,0.55)] transition"
                  >
                    {hero.primaryButton.text}
                  </a>
                )}
                {hero.secondaryButton?.text && (
                  <a
                    href={hero.secondaryButton.href || '#'}
                    target={(hero.secondaryButton.href || '').startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 md:px-6 py-3 rounded-xl border border-white/20 text-white/90 hover:bg-white/10 transition"
                  >
                    {hero.secondaryButton.text}
                  </a>
                )}
              </div>
            </div>

          {hasContentImages(hero) && (
            <div className="mt-6 max-w-2xl">
              <MediaGallery
                entity={hero}
                fallbackAlt={hero.imageAlt || ''}
                variant="strip"
              />
            </div>
          )}

          </div>
        </div>
      </div>

      {/* smooth transition to next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-b from-transparent via-[#06152d]/55 to-[#06152d]" />
    </section>
    {stats.length > 0 && (
      <div className="relative z-10 bg-[#06152d]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-5 md:py-7">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-cyan-300">{s.value}</div>
                <div className="text-[11px] md:text-xs uppercase tracking-wider text-slate-300/70 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  )
}
