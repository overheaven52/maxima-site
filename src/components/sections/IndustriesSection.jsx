import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

export default function IndustriesSection() {
  const content = useContent()
  const industries = content.industries || {}
  const items = industries.items || []

  // Поддержка двух форматов: новый (description/accent/cta/фото) и старый (label/icon)
  const hasRich = items.some(
    (i) => i.description || i.accent || i.ctaText || hasContentImages(i),
  )

  return (
    <section id="industries" className="py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
            Кому мы помогаем
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold">{industries.heading}</h2>
          {industries.description && (
            <p className="mt-4 text-slate-300/90 leading-relaxed">{industries.description}</p>
          )}
        </div>

        {items.length > 0 && (
          hasRich ? (
            <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {items.map((i) => (
                <article
                  key={i.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-5 hover:border-cyan-400/40 transition flex flex-col overflow-hidden"
                >
                  {hasContentImages(i) && (
                    <div className="-mx-5 -mt-5 mb-4 overflow-hidden">
                      <MediaGallery
                        entity={i}
                        fallbackAlt={i.imageAlt?.trim() || i.label || ''}
                        variant="wide"
                        className="aspect-[4/3]"
                      />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    {!hasContentImages(i) && String(i.icon || '').trim() && (
                      <div className="text-4xl shrink-0">{i.icon}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white">
                        {i.label}
                      </h3>
                      {i.description && (
                        <p className="mt-2 text-sm md:text-base text-slate-300/90 leading-relaxed">
                          {i.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {i.accent && (
                    <div className="mt-4 rounded-xl bg-cyan-500/[0.06] border border-cyan-400/20 px-4 py-3 text-sm text-cyan-100">
                      {i.accent}
                    </div>
                  )}
                  {i.ctaText && (
                    <a
                      href={i.ctaHref || '/contact'}
                      target={(i.ctaHref || '').startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition self-start"
                    >
                      {i.ctaText}
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition text-center overflow-hidden"
                >
                  {hasContentImages(i) ? (
                    <div className="-mx-4 -mt-6 mb-3 aspect-[4/3] bg-white/5 overflow-hidden">
                      <MediaGallery
                        entity={i}
                        fallbackAlt={i.imageAlt?.trim() || i.label || ''}
                        variant="square"
                      />
                    </div>
                  ) : String(i.icon || '').trim() ? (
                    <div className="text-3xl mb-2">{i.icon}</div>
                  ) : null}
                  <div className="text-sm text-slate-200">{i.label}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  )
}
