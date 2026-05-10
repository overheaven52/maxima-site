import { useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api/client.js'
import AdminLogin from './AdminLogin.jsx'
import AdminEditor from './AdminEditor.jsx'

export default function AdminApp() {
  const hasToken = typeof window !== 'undefined' && !!getToken()
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(hasToken)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    setChecking(true)
    api
      .me()
      .then(() => setAuthed(true))
      .catch(() => setToken(null))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#06152d] grid place-items-center text-slate-400">
        Загрузка…
      </div>
    )
  }

  if (!authed) {
    return <AdminLogin onAuthed={() => setAuthed(true)} />
  }

  return <AdminEditor onLogout={() => { setToken(null); setAuthed(false) }} />
}
