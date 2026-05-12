import { useEffect } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import SectionRenderer from '../components/SectionRenderer.jsx'
import HomeHeroLeadSection from '../components/sections/HomeHeroLeadSection.jsx'
import { usePath } from '../content/PathContext.jsx'

function normalizeSlug(s) {
  const x = (s || '/').replace(/\/+$/, '')
  return x === '' ? '/' : x
}

export default function PageView({ page }) {
  const blocks = (page?.blocks || []).filter((b) => b.enabled !== false)
  const { navigate } = usePath()
  const slug = normalizeSlug(page?.slug)
  const isHome = slug === '/'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col overflow-x-clip">
      <Header />
      {!isHome && (
        <div
          className="sticky z-30 border-b border-cyan-400/10 bg-gradient-to-r from-[#06152d]/98 via-[#0a1f3d]/95 to-[#06152d]/98 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          style={{ top: 'calc(4rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 min-h-11 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20 hover:border-cyan-400/45 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 touch-manip"
            >
              <span className="text-base leading-none" aria-hidden>
                ←
              </span>
              На главную
            </button>
            <span
              className="hidden sm:inline h-4 w-px bg-white/15"
              aria-hidden
            />
            <span className="text-sm text-slate-400 min-w-0 flex-1 basis-full sm:basis-auto">
              <span className="text-slate-500">Сейчас:</span>{' '}
              <span className="text-slate-200 font-medium break-words">{page.title || slug}</span>
            </span>
          </div>
        </div>
      )}
      <main className="flex-1">
        {isHome ? (
          <div className="relative bg-[#06152d]">
            <div className="absolute inset-0 hero-section-grid opacity-[0.38] pointer-events-none" />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-cyan-500/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl"
            />
            <div className="relative">
              {blocks.map((block) => (
                <SectionRenderer key={block.id} block={block} />
              ))}
              <HomeHeroLeadSection />
            </div>
          </div>
        ) : (
          blocks.map((block) => (
            <SectionRenderer key={block.id} block={block} />
          ))
        )}
      </main>
      <Footer />
    </div>
  )
}
