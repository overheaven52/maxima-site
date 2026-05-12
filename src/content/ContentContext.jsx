import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { useLocale } from '../i18n/LocaleContext.jsx'
import kkOverrides from '../i18n/kk.json'
import { mergeLocalized } from '../i18n/mergeLocalized.js'

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
  const ctx = useContext(ContentContext)
  const { locale } = useLocale()
  return useMemo(
    () =>
      locale === 'kk'
        ? mergeLocalized(ctx.content, kkOverrides)
        : ctx.content,
    [ctx.content, locale],
  )
}

export function useContentApi() {
  return useContext(ContentContext)
}
