// Local stand-in for the Render Static Site, for checking a production build:
//   npm run build && npm run serve:prod     → http://localhost:4173
//
// Mirrors how Render serves dist/ with the rules listed in PRERENDER.md:
//   - a file that exists always wins (Render never applies a rule to an existing path)
//   - /about and /about/ both serve dist/about/index.html
//   - Redirect rules → 301; Rewrite rules → serve app-shell.html with 200
//   - anything else → dist/404.html with HTTP 404
//   - query strings are ignored for matching (Render matches on path only)
// Dev tool only; production does not run this file.
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const DIST = resolve('dist')
const PORT = Number(process.env.PORT ?? 4173)

// Keep in sync with "Render dashboard rules" in PRERENDER.md (same order).
export const RULES = [
  { source: '/how-it-works', destination: '/about', action: 'redirect' },
  { source: '/cart', destination: '/app-shell.html', action: 'rewrite' },
  { source: '/checkout', destination: '/app-shell.html', action: 'rewrite' },
  { source: '/login', destination: '/app-shell.html', action: 'rewrite' },
  { source: '/register', destination: '/app-shell.html', action: 'rewrite' },
  { source: '/my-orders', destination: '/app-shell.html', action: 'rewrite' },
  { source: '/order-confirmation/*', destination: '/app-shell.html', action: 'rewrite' },
  { source: '/admin', destination: '/app-shell.html', action: 'rewrite' },
  { source: '/admin/*', destination: '/app-shell.html', action: 'rewrite' },
]

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json',
}

function fileFor(pathname) {
  const p = normalize(join(DIST, decodeURIComponent(pathname)))
  if (!p.startsWith(DIST)) return null
  if (existsSync(p) && statSync(p).isFile()) return p
  const index = join(p, 'index.html')
  if (existsSync(index)) return index
  return null
}

function matches(source, pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (source.endsWith('/*')) return path.startsWith(source.slice(0, -1))
  return path === source
}

function send(res, status, file, headers = {}) {
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', ...headers })
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  const file = fileFor(pathname)
  if (file) return send(res, 200, file)

  const rule = RULES.find(r => matches(r.source, pathname))
  if (rule?.action === 'redirect') {
    res.writeHead(301, { Location: rule.destination })
    return res.end()
  }
  if (rule?.action === 'rewrite') return send(res, 200, join(DIST, rule.destination))

  send(res, 404, join(DIST, '404.html'))
}).listen(PORT, () => console.log(`Serving dist/ like Render at http://localhost:${PORT}`))
