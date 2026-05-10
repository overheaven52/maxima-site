import { useContent } from '../../content/ContentContext.jsx'

export default function GeographySection() {
  const content = useContent()
  const geo = content.geography || {}
  const items = geo.items || []
  const cities = geo.cities || []

  return (
    <section id="geography" className="relative py-20 md:py-28 bg-gradient-to-b from-transparent via-[#08183a]/40 to-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          {geo.eyebrow && (
            <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-cyan-300/80">
              {geo.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-3xl md:text-5xl font-bold">{geo.heading}</h2>
          {geo.description && (
            <p className="mt-5 text-slate-300/90 leading-relaxed text-base md:text-lg">
              {geo.description}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {items.map((i) => (
              <div
                key={i.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition"
              >
                <div className="text-4xl mb-3">{i.icon}</div>
                <div className="font-semibold text-white">{i.title}</div>
                <p className="mt-2 text-sm text-slate-300/90 leading-relaxed">{i.description}</p>
              </div>
            ))}
          </div>
        )}

        {cities.length > 0 && (
          <div className="mt-12 rounded-3xl border border-cyan-400/20 bg-cyan-500/[0.04] p-6 md:p-8">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
              География работ
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {cities.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1.5 rounded-full border border-cyan-400/20 bg-white/5 text-sm text-cyan-100"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
