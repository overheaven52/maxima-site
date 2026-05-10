import { useState } from 'react'
import { api, setToken } from '../api/client.js'

export default function AdminLogin({ onAuthed }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { token } = await api.login(password)
      setToken(token)
      onAuthed()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#06152d] grid place-items-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-cyan-400/30 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_60px_-12px_rgba(34,211,238,0.4)]"
      >
        <h1 className="text-2xl font-bold text-white">Вход в админ-панель</h1>
        <p className="mt-1 text-sm text-slate-400">
          Введите пароль (задаётся в файле <code>.env</code>).
        </p>
        <label className="mt-6 block text-sm text-slate-300">
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 focus:border-cyan-400/60 outline-none px-4 py-3 text-base text-white"
          />
        </label>
        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-200 text-sm px-4 py-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-400 text-[#06152d] font-semibold hover:bg-cyan-300 disabled:opacity-50 transition"
        >
          {busy ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
