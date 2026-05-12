import { useContent } from '../../content/ContentContext.jsx'
import HomeHeroLeadInner from './HomeHeroLeadInner.jsx'

export default function HeroSection() {
  const content = useContent()
  const hero = content.hero || {}
  const bgUrl =
    String(hero.backgroundImageUrl || hero.imageUrl || hero.images?.[0]?.url || '').trim()
  const bgAlt = String(hero.backgroundImageAlt || hero.imageAlt || '').trim()
  const bgPos = String(hero.backgroundPosition || '50% 50%').trim() || '50% 50%'
  const bgFit = String(hero.backgroundFit || 'cover').trim() || 'cover'
  const scaleRaw = Number(hero.backgroundScale ?? 1)
  // With object-cover, scale < 1 reveals edges. Clamp to >= 1.
  const bgScale = Number.isFinite(scaleRaw) ? Math.min(1.35, Math.max(1, scaleRaw)) : 1

  const imageLinkHref = String(hero.backgroundImageLinkHref ?? '/industries').trim() || '/industries'
  const imageLinkLabel =
    String(hero.backgroundImageLinkLabel || '').trim() ||
    'Перейти в раздел Клининг — услуги и направления'
  const imageLinkDescription =
    String(hero.backgroundImageLinkDescription || '').trim() ||
    'Направления по типам объектов и ориентиры по ценам — нажмите на схему.'
  const imageLinkAria = [imageLinkLabel, imageLinkDescription].filter(Boolean).join('. ')
  const isContainInfographic = Boolean(bgUrl) && bgFit === 'contain'

  return (
    <section
      id="top"
      className="relative z-0 w-full overflow-hidden min-h-[min(34svh,340px)] sm:min-h-[min(52svh,540px)] md:min-h-[min(58svh,600px)] lg:min-h-[min(64svh,680px)]"
    >
      {bgUrl &&
        (bgFit === 'contain' ? (
          <>
            {/* Мобилка / планшет: полноэкранная инфографика */}
            <div className="absolute inset-0 z-0 bg-[#f3f4f6] lg:hidden">
              <img
                src={bgUrl}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover object-center blur-2xl opacity-55 saturate-110"
                style={{ objectPosition: bgPos }}
                loading="eager"
                fetchPriority="high"
              />
              <div
                className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-white/25 via-transparent to-white/35"
                aria-hidden
              />
              <a
                href={imageLinkHref}
                aria-label={imageLinkAria}
                title={imageLinkLabel}
                className="touch-manip group absolute inset-0 z-[2] flex flex-col items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06152d]"
              >
                <span
                  className="hero-cleaning-link-pulse pointer-events-none absolute inset-x-4 top-[30%] bottom-[24%] rounded-2xl border-2 border-cyan-400/30 opacity-80 transition duration-300 group-hover:border-cyan-400/70 group-hover:opacity-100 sm:inset-x-8 sm:top-[28%]"
                  aria-hidden
                />
                <span className="relative z-[1] block h-full w-full origin-center transition duration-300 ease-out group-hover:scale-[1.02] group-active:scale-[0.99]">
                  <img
                    src={bgUrl}
                    alt=""
                    role="presentation"
                    className="relative h-full w-full object-contain"
                    style={{
                      objectPosition: bgPos,
                      transform: bgScale !== 1 ? `scale(${bgScale})` : undefined,
                      transformOrigin: bgPos,
                      WebkitMaskImage:
                        'radial-gradient(ellipse 105% 100% at 50% 48%, #000 0%, #000 62%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0) 100%)',
                      maskImage:
                        'radial-gradient(ellipse 105% 100% at 50% 48%, #000 0%, #000 62%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0) 100%)',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskSize: '100% 100%',
                      maskSize: '100% 100%',
                    }}
                    loading="eager"
                    fetchPriority="high"
                  />
                </span>
              </a>
              <a
                href={imageLinkHref}
                aria-label={imageLinkAria}
                title={imageLinkLabel}
                className="absolute right-3 top-3 z-[5] touch-manip inline-flex items-center gap-2 rounded-lg border border-white/12 bg-black px-3 py-2 text-xs font-semibold tracking-wide text-white shadow-md transition hover:border-white/25 hover:bg-neutral-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f4f6] sm:right-4 sm:top-4 sm:px-3.5 sm:py-2 sm:text-[13px]"
              >
                <span>Клининг</span>
                <span className="select-none text-base font-medium leading-none text-white/90" aria-hidden>
                  →
                </span>
              </a>
              <div
                className="pointer-events-none absolute inset-0 z-[3] bg-black/[0.025]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[38%] bg-gradient-to-t from-black/50 via-black/15 to-transparent sm:h-[42%]" />
            </div>

            {/* Десктоп (lg+): слева заголовок и CTA, справа кликабельная схема */}
            <div className="relative z-[1] hidden w-full bg-[#06152d] lg:block">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_52%_at_72%_32%,rgba(34,211,238,0.13),transparent_58%)]"
                aria-hidden
              />
              <div className="relative mx-auto max-w-7xl px-6 py-10 xl:px-8 xl:py-12">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-8 xl:gap-10">
                  <div className="flex min-h-0 min-w-0">
                    <div className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur-sm xl:p-8">
                      <HomeHeroLeadInner className="text-left" />
                    </div>
                  </div>
                  <div className="flex min-h-0 min-w-0 flex-col self-stretch">
                    <div className="flex min-h-0 flex-1 flex-col items-end justify-center lg:pb-2">
                      <div className="flex w-fit max-w-full flex-col gap-4">
                        <a
                          href={imageLinkHref}
                          aria-label={imageLinkAria}
                          title={imageLinkDescription}
                          className="touch-manip group relative z-[1] inline-flex max-w-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-cyan-400/35 bg-gradient-to-b from-white via-slate-50 to-slate-100 shadow-[0_28px_100px_-18px_rgba(0,0,0,0.88),0_0_0_1px_rgba(255,255,255,0.08)_inset] outline-none ring-1 ring-cyan-400/15 transition duration-300 hover:border-cyan-400/70 hover:shadow-[0_36px_120px_-20px_rgba(34,211,238,0.22)] hover:ring-cyan-400/40 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#06152d] lg:overflow-hidden lg:rounded-2xl lg:border-0 lg:bg-transparent lg:shadow-none lg:ring-0 lg:hover:scale-[1.01] lg:hover:border-transparent lg:hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] lg:hover:ring-0 focus-visible:lg:ring-2 focus-visible:lg:ring-cyan-400 focus-visible:lg:ring-offset-2"
                        >
                          <img
                            src={bgUrl}
                            alt=""
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-105 object-cover object-center opacity-40 blur-2xl saturate-110 lg:hidden"
                            style={{ objectPosition: bgPos }}
                            loading="eager"
                            fetchPriority="high"
                          />
                          <span className="hero-cleaning-link-pulse pointer-events-none absolute inset-3 z-[1] rounded-xl border-2 border-cyan-400/25 opacity-70 sm:inset-4 lg:hidden" />
                          <span className="relative z-[2] block p-3 transition duration-300 ease-out group-hover:scale-[1.015] sm:p-4 lg:p-0 lg:group-hover:scale-100">
                            <img
                              src={bgUrl}
                              alt=""
                              role="presentation"
                              className="mx-auto h-auto w-auto max-h-[min(78vh,820px)] max-w-full object-contain object-center align-bottom drop-shadow-sm lg:mx-0 lg:block lg:max-h-[min(82vh,880px)]"
                              style={{
                                objectPosition: bgPos,
                                transform: bgScale !== 1 ? `scale(${bgScale})` : undefined,
                                transformOrigin: bgPos,
                              }}
                              loading="eager"
                              fetchPriority="high"
                            />
                          </span>
                        </a>
                        <aside aria-label="Схема ведёт в раздел Клининг">
                          <a
                            href={imageLinkHref}
                            aria-label={imageLinkAria}
                            title={imageLinkLabel}
                            className="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-cyan-400 text-[#06152d] shadow-[0_0_30px_-10px_rgba(34,211,238,0.55)] transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06152d] sm:px-6 sm:py-3 sm:text-base"
                          >
                            <span>Клининг</span>
                            <span className="select-none text-base font-semibold leading-none sm:text-lg" aria-hidden>
                              →
                            </span>
                          </a>
                        </aside>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-[#06152d]">
            <a
              href={imageLinkHref}
              aria-label={imageLinkAria}
              title={imageLinkDescription}
              className="touch-manip group absolute inset-0 z-[2] block overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-inset"
            >
              <span className="pointer-events-none absolute left-0 right-0 top-0 z-[4] bg-gradient-to-b from-black/65 via-black/25 to-transparent px-4 pb-10 pt-4 sm:px-6 sm:pt-5">
                <span className="mb-2 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-sm sm:text-[11px]">
                  Нажмите на фото
                </span>
                <p className="max-w-xl text-sm leading-snug text-white/95 drop-shadow-md sm:text-base">
                  {imageLinkDescription}
                </p>
              </span>
              <span className="block h-full w-full origin-center transition duration-500 ease-out group-hover:scale-[1.04] group-active:scale-[1.01]">
                <img
                  src={bgUrl}
                  alt=""
                  role="presentation"
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: bgPos,
                    transform: bgScale !== 1 ? `scale(${bgScale})` : undefined,
                    transformOrigin: bgPos,
                  }}
                  loading="eager"
                  fetchPriority="high"
                />
              </span>
            </a>
            <div className="pointer-events-none absolute inset-0 z-[3] bg-black/5" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[38%] bg-gradient-to-t from-black/50 via-black/15 to-transparent sm:h-[42%]" />
          </div>
        ))}
      {/* Высота секции под абсолютный hero; для contain на lg высоту даёт двухколоночный блок — спейсер скрываем */}
      <div
        className={`pointer-events-none relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-2 pb-6 sm:pt-6 sm:pb-8 md:pt-10 md:pb-10 min-h-[min(34svh,340px)] sm:min-h-[min(52svh,540px)] md:min-h-[min(58svh,600px)] lg:min-h-[min(64svh,680px)] ${isContainInfographic ? 'lg:hidden' : ''}`}
      >
        <div className="section-fade max-w-3xl">
          {hero.eyebrow && (
            <p className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/85 px-3 py-1.5 rounded-full border border-white/15 bg-black/25 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              {hero.eyebrow}
            </p>
          )}
        </div>
      </div>

      {/* smooth transition to next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 sm:h-16 bg-gradient-to-b from-transparent via-[#06152d]/45 to-[#06152d]" />
    </section>
  )
}
