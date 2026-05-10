import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

export default function CleaningSection() {
  const content = useContent()
  const cleaning = content.cleaning || {}
  const categories = cleaning.categories || []
  const highlights = cleaning.highlights || []
  const services = cleaning.services || []

  return (
    <section
      id="cleaning"
      className="relative py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-1">
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
              {cleaning.heading}
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
              {cleaning.leadTitle}
            </h2>
            {cleaning.leadHtml && (
              <div
                className="mt-5 text-slate-300/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: cleaning.leadHtml }}
              />
            )}

            {hasContentImages(cleaning) && (
              <div className="mt-6 neon-card rounded-3xl border border-cyan-400/20 bg-[#0b1d3a] overflow-hidden p-1 sm:p-2">
                <MediaGallery entity={cleaning} fallbackAlt={cleaning.heading} variant="wide" />
              </div>
            )}

            {cleaning.ctaText && (
              <a
                href={cleaning.ctaHref || '/contact'}
                target={(cleaning.ctaHref || '').startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 transition"
              >
                {cleaning.ctaText}
              </a>
            )}
          </div>

          <div className="lg:col-span-2">
            {categories.length > 0 ? (
              <div className="grid gap-5">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 hover:border-cyan-400/40 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl shrink-0">{cat.icon || '✨'}</div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="text-xs uppercase tracking-wider text-cyan-300/70">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-white">
                            {cat.title}
                          </h3>
                        </div>
                        {cat.subtitle && (
                          <div className="text-sm text-cyan-300/80 mt-1">{cat.subtitle}</div>
                        )}
                        {cat.description && (
                          <p className="mt-3 text-slate-300/90 leading-relaxed">
                            {cat.description}
                          </p>
                        )}
                        {(cat.items || []).length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {cat.items.map((it, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-300">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                <span className="text-sm md:text-base">{it}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/5 text-sm text-cyan-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )
            )}

            {highlights.length > 0 && (
              <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/[0.04] p-5 md:p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                  Преимущества при сотрудничестве
                </div>
                <ul className="mt-4 space-y-3">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-200">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
