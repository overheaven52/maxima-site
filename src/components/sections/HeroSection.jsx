import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

export default function HeroSection() {
  const content = useContent()
  const hero = content.hero || {}
  const stats = hero.stats || []

  return (
    <section
      id="top"
      className="relative w-full min-h-0 md:min-h-[min(62svh,680px)]"
    >
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-8 pb-10 md:pt-10 md:pb-14">
        <div className="section-fade max-w-3xl">
          {hero.eyebrow && (
            <p className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/90 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {hero.eyebrow}
            </p>
          )}
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight">
            <span className="text-white">{hero.title}</span>{' '}
            <span className="neon-text">{hero.titleHighlight}</span>
          </h1>
          {hero.subtitle && (
            <p className="mt-6 text-base md:text-lg text-slate-300/90 max-w-xl">{hero.subtitle}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {hero.primaryButton?.text && (
              <a
                href={hero.primaryButton.href || '#'}
                className="inline-flex items-center gap-2 px-5 md:px-6 py-3 rounded-2xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)] transition"
              >
                {hero.primaryButton.text}
              </a>
            )}
            {hero.secondaryButton?.text && (
              <a
                href={hero.secondaryButton.href || '#'}
                target={(hero.secondaryButton.href || '').startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 md:px-6 py-3 rounded-2xl border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10 transition"
              >
                {hero.secondaryButton.text}
              </a>
            )}
          </div>

          {hasContentImages(hero) && (
            <div className="mt-8 max-w-2xl">
              <MediaGallery
                entity={hero}
                fallbackAlt={hero.imageAlt || ''}
                variant="strip"
              />
            </div>
          )}

          {stats.length > 0 && (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-cyan-300">{s.value}</div>
                  <div className="text-[11px] md:text-xs uppercase tracking-wider text-slate-400 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
