import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
// Self-hosted Inter (one variable-weight file) — bundled with our CSS instead of a
// render-blocking @import to Google Fonts.
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'
import AppProviders from './AppProviders.jsx'
import { readPreloadFromDocument } from './ssr/preload.js'
import { canonicalPath } from './seo/site.js'

const container = document.getElementById('root')
const preload = readPreloadFromDocument()

// Public pages arrive pre-rendered (scripts/prerender.js) — React then "hydrates": it attaches to
// the HTML that's already there instead of drawing the page again. That only works when this
// HTML was rendered for this exact URL. Otherwise — app-shell.html (cart, checkout, login …),
// 404.html (also used for products/posts newer than the last build), or an old ?c=/?e= link
// that redirects — the page is rendered from scratch.
const search = new URLSearchParams(window.location.search)
const canHydrate =
  container.hasChildNodes() &&
  preload?.route != null &&
  preload.route === canonicalPath(window.location.pathname) &&
  !search.has('c') && !search.has('e')

const app = (
  <StrictMode>
    <AppProviders preload={preload} deferStoredCart={canHydrate}>
      <App />
    </AppProviders>
  </StrictMode>
)

if (canHydrate) {
  hydrateRoot(container, app)
} else {
  container.textContent = ''
  createRoot(container).render(app)
}
