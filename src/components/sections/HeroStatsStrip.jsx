import { useContent } from '../../content/ContentContext.jsx'

/** Цифры из hero.stats — показываются под блоком «Главные разделы» на главной */
export default function HeroStatsStrip({ className = '', compactMobile = false }) {
  const stats = useContent().hero?.stats || []
  if (!stats.length) return null

  const mobileTight = compactMobile
    ? 'gap-1 sm:gap-3 md:gap-4'
    : 'gap-2 sm:gap-3 md:gap-4'
  const cellPad = compactMobile
    ? 'p-1.5 sm:p-4'
    : 'p-2.5 sm:p-4'
  const valueSize = compactMobile
    ? 'text-sm sm:text-2xl md:text-3xl'
    : 'text-lg sm:text-2xl md:text-3xl'
  const labelSize = compactMobile
    ? 'text-[8px] sm:text-[11px] md:text-xs'
    : 'text-[9px] sm:text-[11px] md:text-xs'

  return (
    <div className={`relative z-10 ${className}`}>
      <div className={`grid grid-cols-2 sm:grid-cols-4 ${mobileTight}`}>
        {stats.map((s) => (
          <div
            key={s.id}
            className={`rounded-md sm:rounded-xl border border-white/10 bg-white/5 text-center ${cellPad}`}
          >
            <div className={`${valueSize} font-bold text-cyan-300 leading-tight`}>{s.value}</div>
            <div
              className={`${labelSize} uppercase tracking-wider text-slate-300/70 mt-px sm:mt-1 leading-snug`}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
