import MediaGallery from '../MediaGallery.jsx'
import { getContentImages, hasContentImages } from '../../utils/contentImages.js'

// Универсальный кастомный блок — настраивается в админке (Страницы → блок «Свой раздел»).
// Поля: title, subtitle, body (HTML), imageUrl / imageAlt / images[], ctaText, ctaHref,
// layout: 'left' | 'right' | 'center' | 'gallery'
export default function CustomSection({ block }) {
  const data = block.data || {}
  const layout = data.layout || 'left'

  if (layout === 'gallery') {
    const imgs = getContentImages(data, data.title || '')
    return (
      <section id={block.id} className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {data.subtitle && (
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80 text-center">
              {data.subtitle}
            </p>
          )}
          {data.title && (
            <h2 className="mt-3 text-3xl md:text-5xl font-bold text-center">{data.title}</h2>
          )}
          {data.body && (
            <div
              className="mt-5 max-w-3xl mx-auto text-center text-slate-300/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          )}
          {imgs.length > 0 && (
            <div
              className={`mt-10 grid gap-3 md:gap-4 ${
                imgs.length === 1
                  ? 'grid-cols-1 max-w-4xl mx-auto'
                  : imgs.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-2 md:grid-cols-3'
              }`}
            >
              {imgs.map((im, i) => (
                <div
                  key={`${im.url}-${i}`}
                  className="rounded-2xl overflow-hidden border border-white/10 bg-[#0b1d3a] aspect-[4/3]"
                >
                  <img src={im.url} alt={im.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
          {data.ctaText && (
            <div className="mt-10 flex justify-center">
              <a
                href={data.ctaHref || '#'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 transition"
              >
                {data.ctaText}
              </a>
            </div>
          )}
        </div>
      </section>
    )
  }

  if (layout === 'center') {
    return (
      <section id={block.id} className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          {data.subtitle && (
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">{data.subtitle}</p>
          )}
          {data.title && (
            <h2 className="mt-3 text-3xl md:text-5xl font-bold">{data.title}</h2>
          )}
          {data.body && (
            <div
              className="mt-5 text-slate-300/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          )}
          {hasContentImages(data) && (
            <div className="mt-8">
              <MediaGallery entity={data} variant="inline" />
            </div>
          )}
          {data.ctaText && (
            <a
              href={data.ctaHref || '#'}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 transition"
            >
              {data.ctaText}
            </a>
          )}
        </div>
      </section>
    )
  }

  return (
    <section id={block.id} className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className={layout === 'right' ? 'order-2' : ''}>
          {data.subtitle && (
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">{data.subtitle}</p>
          )}
          {data.title && (
            <h2 className="mt-3 text-3xl md:text-5xl font-bold">{data.title}</h2>
          )}
          {data.body && (
            <div
              className="mt-5 text-slate-300/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          )}
          {data.ctaText && (
            <a
              href={data.ctaHref || '#'}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 transition"
            >
              {data.ctaText}
            </a>
          )}
        </div>
        <div className={layout === 'right' ? 'order-1' : ''}>
          <div className="neon-card rounded-3xl border border-cyan-400/20 bg-[#0b1d3a] overflow-hidden min-h-[200px] p-1 sm:p-2">
            {hasContentImages(data) ? (
              <MediaGallery entity={data} variant="wide" />
            ) : (
              <div className="aspect-[4/3] grid place-items-center text-7xl">✨</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
