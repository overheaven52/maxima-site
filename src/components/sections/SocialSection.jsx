import { useContent } from '../../content/ContentContext.jsx'

export default function SocialSection() {
  const content = useContent()
  const social = content.social || {}
  const contact = content.contact || {}

  const cards = []
  if (contact.instagramUrl) {
    cards.push({
      id: 'ig',
      label: 'Instagram',
      handle: contact.instagramHandle,
      text: social.instagramText,
      url: contact.instagramUrl,
      gradient: 'from-pink-500/30 via-fuchsia-500/20 to-amber-400/20',
    })
  }
  if (contact.tiktokUrl) {
    cards.push({
      id: 'tt',
      label: 'TikTok',
      handle: contact.tiktokHandle,
      text: social.tiktokText,
      url: contact.tiktokUrl,
      gradient: 'from-cyan-500/30 via-pink-500/20 to-slate-300/10',
    })
  }
  if (social.youtubeUrl) {
    cards.push({
      id: 'yt',
      label: 'YouTube',
      handle: '',
      text: social.youtubeText,
      url: social.youtubeUrl,
      gradient: 'from-red-500/30 via-rose-500/20 to-slate-300/10',
    })
  }

  if (cards.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-4xl font-bold text-center">{social.heading}</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c) => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${c.gradient} p-6 hover:border-cyan-400/40 transition`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{c.label}</span>
                <span className="text-cyan-300 group-hover:translate-x-1 transition">→</span>
              </div>
              {c.handle && <div className="mt-1 text-sm text-cyan-200/90">{c.handle}</div>}
              {c.text && <p className="mt-3 text-sm text-slate-200/90">{c.text}</p>}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
