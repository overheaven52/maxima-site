import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { getContentImages, hasContentImages } from '../../utils/contentImages.js'

export default function IndustriesSection() {
  const content = useContent()
  const industries = content.industries || {}
  const items = industries.items || []
  const partnersStrip = industries.partnersStrip || {}
  const partnerImages = getContentImages(
    {
      images: partnersStrip.images,
      imageUrl: partnersStrip.imageUrl,
      imageAlt: partnersStrip.imageAlt,
    },
    String(partnersStrip.heading || '').trim() || 'Партнёр',
  )

  // Поддержка двух форматов: новый (description/accent/cta/фото/цена) и старый (label/icon)
  const hasRich = items.some(
    (i) =>
      i.description ||
      i.accent ||
      i.ctaText ||
      String(i.price || '').trim() ||
      hasContentImages(i),
  )

  function PriceBlock({ item }) {
    const price = String(item.price || '').trim()
    const note = String(item.priceNote || '').trim()
    if (!price && !note) return null
    return (
      <div className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-500/[0.07] px-3 py-2.5">
        {price && (
          <div className="text-base md:text-lg font-bold text-cyan-200 tabular-nums">{price}</div>
        )}
        {note && <p className="mt-1 text-[11px] md:text-xs text-slate-400 leading-snug">{note}</p>}
      </div>
    )
  }

  return (
    <section id="industries" className="py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
            Направления клининга
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold">{industries.heading}</h2>
          {industries.description && (
            <p className="mt-4 text-slate-300/90 leading-relaxed">{industries.description}</p>
          )}
        </div>

        {items.length > 0 && (
          hasRich ? (
            <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
              {items.map((i) => (
                <article
                  key={i.id}
                  className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/40 md:p-5"
                >
                  {hasContentImages(i) && (
                    <div className="relative -mx-5 -mt-5 mb-4 aspect-[4/3] w-auto shrink-0 overflow-hidden">
                      <MediaGallery
                        entity={i}
                        fallbackAlt={i.imageAlt?.trim() || i.label || ''}
                        variant="carousel"
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  )}
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex min-h-0 flex-1 items-start gap-4">
                      {!hasContentImages(i) && String(i.icon || '').trim() && (
                        <div className="shrink-0 text-4xl">{i.icon}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-white md:text-xl">{i.label}</h3>
                        {i.description && (
                          <p className="mt-2 text-sm leading-relaxed text-slate-300/90 md:text-base">
                            {i.description}
                          </p>
                        )}
                        <PriceBlock item={i} />
                      </div>
                    </div>
                    {(i.accent || i.ctaText) && (
                      <div className="mt-4 flex flex-col gap-4">
                        {i.accent && (
                          <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/[0.06] px-4 py-3 text-sm text-cyan-100">
                            {i.accent}
                          </div>
                        )}
                        {i.ctaText && (
                          <a
                            href={i.ctaHref || '/contact'}
                            target={(i.ctaHref || '').startsWith('http') ? '_blank' : undefined}
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 self-start rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-2.5 text-cyan-200 transition hover:bg-cyan-500/20"
                          >
                            {i.ctaText}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6 items-stretch">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex h-full min-h-[11rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center transition hover:border-cyan-400/40 hover:bg-cyan-500/5"
                >
                  {hasContentImages(i) ? (
                    <div className="relative -mx-4 -mt-6 mb-3 aspect-[4/3] shrink-0 overflow-hidden bg-white/5">
                      <MediaGallery
                        entity={i}
                        fallbackAlt={i.imageAlt?.trim() || i.label || ''}
                        variant="carousel"
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  ) : String(i.icon || '').trim() ? (
                    <div className="text-3xl mb-2">{i.icon}</div>
                  ) : null}
                  <div className="text-sm text-slate-200">{i.label}</div>
                  {String(i.price || '').trim() && (
                    <div className="mt-1.5 text-[11px] font-semibold text-cyan-300 leading-tight">
                      {i.price}
                    </div>
                  )}
                  {String(i.priceNote || '').trim() && (
                    <div className="mt-0.5 text-[10px] text-slate-500 leading-tight">{i.priceNote}</div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {partnerImages.length > 0 && (
          <div className="mt-14 md:mt-16 border-t border-white/10 pt-10 md:pt-12">
            <div className="mx-auto max-w-3xl text-center">
              {(partnersStrip.heading || '').trim() && (
                <h3 className="text-xl font-bold text-white md:text-2xl">{partnersStrip.heading.trim()}</h3>
              )}
              {(partnersStrip.subtitle || '').trim() && (
                <p className="mt-2 text-sm text-slate-400 md:text-base">{partnersStrip.subtitle.trim()}</p>
              )}
            </div>
            <div
              className="mt-6 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {partnerImages.map((im, idx) => (
                <div
                  key={`${im.url}-${idx}`}
                  className="h-24 w-40 shrink-0 snap-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] sm:h-28 sm:w-44 md:h-32 md:w-52"
                >
                  <img
                    src={im.url}
                    alt={im.alt}
                    className="h-full w-full object-contain p-3"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
