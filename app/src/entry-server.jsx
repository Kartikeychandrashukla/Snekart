// Build-time render entry, bundled by `vite build --ssr` and called by scripts/prerender.js.
// Renders one route to HTML with the real components and the data fetched at build time.
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App.jsx'
import AppProviders from './AppProviders.jsx'
import { SeoCollectorContext } from './seo/SeoCollector.js'

async function streamToString(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks).toString('utf8')
}

// url: the path to render (e.g. "/shop/utsav-premium-hamper")
// preload: the data the page renders with (see src/ssr/preload.js)
// Returns { html, seo } — html goes inside <div id="root">, seo is what <Seo> collected.
export async function render(url, preload) {
  const collector = {}
  // prerender (unlike renderToString) waits for lazy-loaded pages and Suspense to finish.
  const { prelude } = await prerenderToNodeStream(
    <SeoCollectorContext.Provider value={collector}>
      <AppProviders preload={preload} deferStoredCart>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppProviders>
    </SeoCollectorContext.Provider>,
  )
  return { html: await streamToString(prelude), seo: collector.tags ?? null }
}
