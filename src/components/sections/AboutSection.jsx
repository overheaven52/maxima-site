import { useContent } from '../../content/ContentContext.jsx'
import MediaGallery from '../MediaGallery.jsx'
import { hasContentImages } from '../../utils/contentImages.js'

export default function AboutSection() {
  const content = useContent()
  const about = content.about || {}
  const advantages = about.advantages || []

  return (
    <section id="about" className="relative py-20 md:py-28">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
      />
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            {about.eyebrow && (
              <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
                {about.eyebrow}
              </p>
            )}
            <h2 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
              {about.heading}
            </h2>
            {about.intro && (
              <p className="mt-5 text-slate-300/90 leading-relaxed text-base md:text-lg">
                {about.intro}
              </p>
            )}
            <div className="mt-8 neon-card rounded-3xl border border-cyan-400/20 bg-[#0b1d3a] overflow-hidden min-h-[200px]">
              {hasContentImages(about) ? (
                <div className="p-1 sm:p-2">
                  <MediaGallery
                    entity={about}
                    fallbackAlt={about.imageAlt || about.heading}
                    variant="wide"
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] grid place-items-center text-center px-8">
                  <div>
                    <div className="text-7xl mb-3">🏢</div>
                    <p className="text-slate-400 text-sm">Загрузите фото команды или офиса</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            {about.advantagesTitle && (
              <h3 className="text-xl md:text-2xl font-semibold text-cyan-200">
                {about.advantagesTitle}
              </h3>
            )}
            <div className="mt-5 space-y-4">
              {advantages.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl shrink-0">{a.icon}</div>
                    <div>
                      <div className="font-semibold text-white">{a.title}</div>
                      <p className="mt-1 text-sm text-slate-300/90 leading-relaxed">
                        {a.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
