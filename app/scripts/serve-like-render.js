// Local stand-in for the Render Static Site, for checking a production build:
//   npm run build && npm run serve:prod     → http://localhost:4173
//
// Mirrors how Render serves dist/ (checked against the live site on 2026-11-12):
//   - only an exact file path is served as-is, plus a folder's index.html when the URL ends in
//     "/" (/occasions/wedding/ works; /occasions/wedding does NOT find occasions/wedding/index.html,
//     and /404 does not find 404.html)
//   - a file that exists always wins (Render never applies a rule to an existing path)
//   - otherwise the rules below, top to bottom, first match wins; ":name" matches one path
//     segment and can be reused in the destination; "*" matches the rest of the path
//   - Redirect → 301; Rewrite → serve the destination file with 200 (404.html + 404 if missing)
//   - no file and no rule → dist/404.html with HTTP 404
//   - query strings are ignored for matching
// Dev tool only; production does not run this file.
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const DIST = resolve('dist')
const PORT = Number(process.env.PORT ?? 4173)

const page = source => ({ source, destination: `${source}/index.html`, action: 'rewrite' })
const shell = source => ({ source, destination: '/app-shell.html', action: 'rewrite' })

// Keep in sync with "Render dashboard rules" in PRERENDER.md (same order).
export const RULES = [
  { source: '/how-it-works', destination: '/about', action: 'redirect' },
  // Pre-rendered pages: clean URL → its index.html
  page('/about'),
  page('/blog'),
  page('/emotions'),
  page('/festivals'),
  page('/occasions'),
  page('/emotions/:slug'),
  page('/festivals/:slug'),
  page('/occasions/:slug'),
  page('/shop/:slug'),
  page('/blog/:slug'),
  // Client-only pages: the noindex app shell
  shell('/cart'),
  shell('/checkout'),
  shell('/login'),
  shell('/register'),
  shell('/my-orders'),
  shell('/order-confirmation/*'),
  shell('/admin'),
  shell('/admin/*'),
]

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json',
}

// Exact file, or folder index only for URLs ending in "/" (and the site root).
function fileFor(pathname) {
  const p = normalize(join(DIST, decodeURIComponent(pathname)))
  if (!p.startsWith(DIST)) return null
  if (existsSync(p) && statSync(p).isFile()) return p
  if (pathname.endsWith('/') && existsSync(join(p, 'index.html'))) return join(p, 'index.html')
  return null
}

// Returns the destination with placeholders filled in, or null if the rule doesn't match.
function apply(rule, pathname) {
  const src = rule.source.split('/')
  const path = pathname.split('/')
  const params = {}
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '*') return rule.destination
    if (i >= path.length) return null
    if (src[i].startsWith(':')) {
      if (!path[i]) return null
      params[src[i]] = path[i]
    } else if (src[i] !== path[i]) {
      return null
    }
  }
  if (path.length !== src.length) return null
  return rule.destination.replace(/:[a-z]+/gi, name => params[name] ?? name)
}

function send(res, status, file, headers = {}) {
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', ...headers })
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  const file = fileFor(pathname)
  if (file) return send(res, 200, file)

  for (const rule of RULES) {
    const destination = apply(rule, pathname)
    if (destination == null) continue
    if (rule.action === 'redirect') {
      res.writeHead(301, { Location: destination })
      return res.end()
    }
    const target = fileFor(destination)
    return target ? send(res, 200, target) : send(res, 404, join(DIST, '404.html'))
  }

  send(res, 404, join(DIST, '404.html'))
}).listen(PORT, () => console.log(`Serving dist/ like Render at http://localhost:${PORT}`))
