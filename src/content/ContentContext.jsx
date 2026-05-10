import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ContentContext = createContext({ content: {}, refresh: () => {} })

export function ContentProvider({ initial = {}, children }) {
  const [content, setContent] = useState(initial)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/content')
      if (!res.ok) return
      const data = await res.json()
      setContent(data)
    } catch (err) {
      console.error('[content] refresh error:', err)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!initial || Object.keys(initial).length === 0) refresh()
  }, [initial, refresh])

  return (
    <ContentContext.Provider value={{ content, refresh, setContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  return useContext(ContentContext).content
}

export function useContentApi() {
  return useContext(ContentContext)
}
