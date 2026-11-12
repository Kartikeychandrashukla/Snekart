// Local stand-in for the Render Static Site, for checking a production build:
//   npm run build && npm run serve:prod     → http://localhost:4173
//
// Mirrors how Render serves dist/ (checked against the live site on 2026-11-12):
//   1. an exact file path is served as-is; a folder's index.html only when the URL ends in "/"
//      (Render never applies a rule to a path where a file exists)
//   2. otherwise the rules below, top to bottom, first match wins; ":name" matches one path
//      segment and can be reused in the destination; "*" matches the rest of the path.
//      Redirect → 301. Rewrite → the destination file with 200 — and if that file doesn't
//      exist, Render answers 200 with an EMPTY body (so don't rewrite to files that may not exist)
//   3. otherwise "<path>.html" if it exists (/shop/x → shop/x.html, /404 → 404.html)
//   4. otherwise dist/404.html with HTTP 404
//   - query strings are ignored for matching
// Dev tool only; production does not run this file.
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const DIST = resolve('dist')
const PORT = Number(process.env.PORT ?? 4173)

const shell = source => ({ source, destination: '/app-shell.html', action: 'rewrite' })

// Keep in sync with "Render dashboard rules" in PRERENDER.md (same order).
// Pre-rendered pages need no rules: they're found as <path>.html (step 3).
export const RULES = [
  { source: '/how-it-works', destination: '/about', action: 'redirect' },
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
    if (target) return send(res, 200, target)
    res.writeHead(200) // what Render does for a rewrite to a missing file
    return res.end()
  }

  const html = pathname !== '/' && !pathname.endsWith('/') ? fileFor(`${pathname}.html`) : null
  if (html) return send(res, 200, html)

  send(res, 404, join(DIST, '404.html'))
}).listen(PORT, () => console.log(`Serving dist/ like Render at http://localhost:${PORT}`))
