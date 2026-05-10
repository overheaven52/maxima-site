import { hydrateRoot, createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ContentProvider } from './content/ContentContext.jsx'
import { PathProvider } from './content/PathContext.jsx'
import './styles/global.css'

const initialContent = window.__CONTENT__ || {}
const container = document.getElementById('root')

const tree = (
  <ContentProvider initial={initialContent}>
    <PathProvider initial={window.location.pathname}>
      <App />
    </PathProvider>
  </ContentProvider>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
