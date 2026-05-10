import { createContext, useContext, useEffect, useState } from 'react'

const PathContext = createContext({ path: '/', navigate: () => {} })

export function PathProvider({ initial = '/', children }) {
  const [path, setPath] = useState(initial)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function navigate(next) {
    if (typeof window === 'undefined') return
    if (next === window.location.pathname) return
    window.history.pushState({}, '', next)
    setPath(next)
    window.scrollTo(0, 0)
  }

  return <PathContext.Provider value={{ path, navigate }}>{children}</PathContext.Provider>
}

export function usePath() {
  return useContext(PathContext)
}
