import { useContent } from '../../content/ContentContext.jsx'
import { hasContentImages } from '../../utils/contentImages.js'
import HomeHeroLeadInner from './HomeHeroLeadInner.jsx'

/** Заголовок главной («Безупречная чистота…»), подзаголовок и CTA — под блоком аренды; на lg+ дублируется в герое слева и скрыт здесь. */
export default function HomeHeroLeadSection() {
  const hero = useContent().hero || {}

  const hasText =
    hero.title ||
    hero.titleHighlight ||
    hero.subtitle ||
    hero.primaryButton?.text ||
    hasContentImages(hero)

  if (!hasText) return null

  return (
    <section
      id="hero-lead"
      className="relative z-10 scroll-mt-20 border-t border-white/10 bg-gradient-to-b from-[#06152d] to-[#050f24] py-8 sm:py-10 md:py-12 lg:hidden"
      aria-label="Главное предложение"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(34,211,238,0.12),transparent_55%)]" />
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/35 px-4 py-5 shadow-xl backdrop-blur-sm sm:px-6 sm:py-6 md:px-8 md:py-7">
          <HomeHeroLeadInner />
        </div>
      </div>
    </section>
  )
}
