export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-cyan-400 text-sm tracking-[0.3em] uppercase mb-4">404</p>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Страница не найдена</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        Похоже, вы перешли по ссылке, которой больше нет. Вернитесь на главную.
      </p>
      <a
        href="/"
        className="px-6 py-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition"
      >
        На главную
      </a>
    </div>
  )
}
