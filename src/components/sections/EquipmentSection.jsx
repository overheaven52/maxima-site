import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

export default function EquipmentSection() {
  const content = useContent()
  const eq = content.equipment || {}
  const models = eq.models || []

  return (
    <section id="equipment" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-3xl">
          {eq.eyebrow && (
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
              {eq.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl md:text-5xl font-bold">{eq.heading}</h2>
          {eq.description && (
            <p className="mt-5 text-slate-300/90 leading-relaxed text-base md:text-lg">
              {eq.description}
            </p>
          )}
        </div>

        {models.length > 0 && (
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {models.map((m) => (
              <article
                key={m.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-cyan-400/40 transition flex flex-col"
              >
                <div className="aspect-square bg-[#0b1d3a] grid place-items-center overflow-hidden">
                  {hasContentImages(m) ? (
                    <MediaGallery entity={m} fallbackAlt={m.name} variant="square" />
                  ) : (
                    <div className="text-5xl sm:text-6xl">🚜</div>
                  )}
                </div>
                <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <h3 className="text-base md:text-lg font-bold text-white leading-tight">{m.name}</h3>
                    {m.type && (
                      <span className="shrink-0 self-start text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                        {m.type}
                      </span>
                    )}
                  </div>
                  {m.description && (
                    <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed line-clamp-4 sm:line-clamp-none">
                      {m.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
