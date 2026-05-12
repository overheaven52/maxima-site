import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { ContentProvider } from './content/ContentContext.jsx'
import { PathProvider } from './content/PathContext.jsx'
import { LocaleProvider } from './i18n/LocaleContext.jsx'

function normalize(p) {
  const x = (p || '/').replace(/\/+$/, '')
  return x === '' ? '/' : x
}

function findPage(content, path) {
  const pages = content?.pages || []
  const clean = normalize(path)
  return pages.find((p) => normalize(p.slug || '/') === clean)
}

export function render(url, content) {
  const pathname = (url || '/').split('?')[0]
  const isAdmin = pathname.startsWith('/admin')
  const page = isAdmin ? null : findPage(content, pathname)
  const status = isAdmin || page ? 200 : 404

  const html = renderToString(
    <ContentProvider initial={content}>
      <LocaleProvider>
        <PathProvider initial={pathname}>
          <App />
        </PathProvider>
      </LocaleProvider>
    </ContentProvider>,
  )

  return { html, status }
}
