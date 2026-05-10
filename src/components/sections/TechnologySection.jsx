import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

export default function TechnologySection() {
  const content = useContent()
  const tech = content.technology || {}
  const benefits = tech.benefits || []

  return (
    <section id="technology" className="relative py-20 md:py-28 bg-gradient-to-b from-transparent via-[#08183a]/40 to-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          {tech.eyebrow && (
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
              {tech.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl md:text-5xl font-bold">{tech.heading}</h2>
          {tech.leadHtml && (
            <div
              className="mt-5 text-slate-300/90 leading-relaxed text-base md:text-lg"
              dangerouslySetInnerHTML={{ __html: tech.leadHtml }}
            />
          )}
        </div>

        {hasContentImages(tech) && (
          <div className="mt-10 neon-card rounded-3xl border border-cyan-400/20 bg-[#0b1d3a] overflow-hidden max-w-4xl mx-auto p-1 sm:p-2">
            <MediaGallery entity={tech} fallbackAlt={tech.heading} variant="wide" />
          </div>
        )}

        {benefits.length > 0 && (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {benefits.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition"
              >
                <div className="text-4xl mb-3">{b.icon}</div>
                <div className="font-semibold text-white">{b.title}</div>
                <p className="mt-2 text-sm text-slate-300/90 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
