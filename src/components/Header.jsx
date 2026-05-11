import { useState } from 'react'
import { useContent } from '../content/ContentContext.jsx'
import { usePath } from '../content/PathContext.jsx'

function normalizePath(p) {
  const x = (p || '/').replace(/\/+$/, '')
  return x === '' ? '/' : x
}

function isClientRoute(href) {
  return (
    typeof href === 'string' &&
    href.startsWith('/') &&
    !href.startsWith('//') &&
    !href.startsWith('/admin')
  )
}

export default function Header() {
  const content = useContent()
  const header = content.header || {}
  const [mobileOpen, setMobileOpen] = useState(false)
  const { path, navigate } = usePath()

  const links = header.navLinks || []

  function NavItem({ href, className, children, onAfterNavigate }) {
    if (isClientRoute(href)) {
      const hashIdx = href.indexOf('#')
      const pathOnlyRaw = hashIdx >= 0 ? href.slice(0, hashIdx) : href
      const hash = hashIdx >= 0 ? href.slice(hashIdx + 1) : ''
      const pathOnly = normalizePath(pathOnlyRaw || '/')
      const active = normalizePath(path) === pathOnly
      return (
        <a
          href={href}
          aria-current={active ? 'page' : undefined}
          className={
            active ? `${className} text-cyan-300 font-medium` : className
          }
          onClick={(e) => {
            e.preventDefault()
            navigate(pathOnly)
            if (hash) {
              const run = () =>
                document.getElementById(hash)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              requestAnimationFrame(() => requestAnimationFrame(run))
            }
            onAfterNavigate?.()
          }}
        >
          {children}
        </a>
      )
    }
    return (
      <a href={href} className={className} onClick={onAfterNavigate}>
        {children}
      </a>
    )
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#06152d]/80 border-b border-white/5 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 min-h-16 flex items-center justify-between gap-2 sm:gap-4">
        <NavItem
          href="/"
          className="flex items-center gap-3 min-w-0 shrink-0"
          onAfterNavigate={() => setMobileOpen(false)}
        >
          {header.logoImageUrl ? (
            <span className="relative h-12 w-28 sm:h-14 sm:w-36 shrink-0">
              <img
                src={header.logoImageUrl}
                alt={
                  header.logoImageAlt?.trim() ||
                  `${(header.logoText || 'MAXIMA').trim()} — логотип`
                }
                className="h-full w-full object-contain object-left"
                decoding="async"
              />
            </span>
          ) : (
            <span className="grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold shrink-0">
              {(header.logoText || 'M').trim().charAt(0).toUpperCase()}
            </span>
          )}
        </NavItem>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <NavItem
              key={l.id}
              href={l.href}
              className="text-sm text-slate-300 hover:text-cyan-300 transition"
            >
              {l.label}
            </NavItem>
          ))}
        </nav>

        <NavItem
          href={header.ctaButtonHref || '/contact'}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-sm font-medium transition"
        >
          {header.ctaButtonText || 'Связаться'}
        </NavItem>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden grid place-items-center min-w-11 min-h-11 rounded-lg border border-white/10 text-slate-200 touch-manip"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#06152d]/95 max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto overscroll-contain">
          <nav className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-col gap-1 pb-[env(safe-area-inset-bottom)]">
            {links.map((l) => (
              <NavItem
                key={l.id}
                href={l.href}
                onAfterNavigate={() => setMobileOpen(false)}
                className="min-h-12 px-2 py-3 text-base text-slate-200 hover:text-cyan-300 transition rounded-lg active:bg-white/5"
              >
                {l.label}
              </NavItem>
            ))}
            <NavItem
              href={header.ctaButtonHref || '/contact'}
              onAfterNavigate={() => setMobileOpen(false)}
              className="mt-2 min-h-12 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-medium text-base touch-manip"
            >
              {header.ctaButtonText || 'Связаться'}
            </NavItem>
          </nav>
        </div>
      )}
    </header>
  )
}
