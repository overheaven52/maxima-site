import { usePath } from './content/PathContext.jsx'
import { useContent } from './content/ContentContext.jsx'
import PageView from './pages/PageView.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import AdminApp from './admin/AdminApp.jsx'

function normalize(p) {
  const x = (p || '/').replace(/\/+$/, '')
  return x === '' ? '/' : x
}

function findPage(content, path) {
  const pages = content?.pages || []
  const clean = normalize(path)
  return pages.find((p) => normalize(p.slug || '/') === clean)
}

export default function App() {
  const { path } = usePath()
  const content = useContent()

  if (path && path.startsWith('/admin')) return <AdminApp />

  const page = findPage(content, path)
  if (page) return <PageView page={page} />

  return <NotFoundPage />
}
