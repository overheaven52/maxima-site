import { useUiString } from '../i18n/LocaleContext.jsx'

export default function NotFoundPage() {
  const badge = useUiString('notFoundBadge')
  const title = useUiString('notFoundTitle')
  const body = useUiString('notFoundBody')
  const back = useUiString('notFoundBack')
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-cyan-400 text-sm tracking-[0.3em] uppercase mb-4">{badge}</p>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
      <p className="text-slate-400 mb-8 max-w-md">{body}</p>
      <a
        href="/"
        className="px-6 py-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition"
      >
        {back}
      </a>
    </div>
  )
}
