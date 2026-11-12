// Build step 3 of 3 (see "build" in package.json): writes a real HTML file for every public page.
//
//   1. vite build                       → dist/ (the browser app; dist/index.html is the template)
//   2. vite build --ssr …                → dist-ssr/entry-server.js (renders a route to HTML)
//   3. node scripts/prerender.js         → this script:
//        - fetches categories, products and blog posts from the API (with retries)
//        - renders each public route with the real React components → dist/<route>/index.html,
//          with its own <title>, description, canonical, Open Graph tags and full body content
//        - dist/404.html   — "Page not found" (noindex); the host serves it with HTTP 404
//        - dist/app-shell.html — empty app + noindex, for /cart, /checkout, /login … (host rewrite)
//        - dist/sitemap.xml — exactly the pages written above
//
// New products/posts/categories appear after the next build: the API calls a Render Deploy Hook
// after admin edits (SnekartApi/Services/DeployHookService.cs), plus a weekly rebuild
// (.github/workflows/weekly-rebuild.yml). See PRERENDER.md.
//
// The build FAILS (rather than publishing a site with pages missing) if the API can't be
// reached after all retries or returns no products/categories.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const SITE = 'https://snekart.in'
const DIST = resolve('dist')
const SSR_ENTRY = resolve('dist-ssr/entry-server.js')

const env = { ...loadEnv(process.env.NODE_ENV || 'production', process.cwd(), ''), ...process.env }
const API_HOST = (env.VITE_API_HOST ?? '').replace(/\/+$/, '')
const TIMEOUT_MS = Number(env.PRERENDER_FETCH_TIMEOUT_MS ?? 30_000)
const ATTEMPTS = Number(env.PRERENDER_FETCH_ATTEMPTS ?? 6)
const ALLOW_EMPTY = env.PRERENDER_ALLOW_EMPTY === '1'

function fail(message) {
  console.error(`\nprerender: FAILED — ${message}\n`)
  process.exit(1)
}

if (!API_HOST) fail('VITE_API_HOST is not set (e.g. https://api.snekart.in).')
if (!existsSync(join(DIST, 'index.html'))) fail('dist/index.html missing — run `vite build` first.')
if (!existsSync(SSR_ENTRY)) fail('dist-ssr/entry-server.js missing — run `vite build --ssr src/entry-server.jsx --outDir dist-ssr` first.')

const sleep = ms => new Promise(r => setTimeout(r, ms))

// GET with a timeout and exponential backoff (2s, 4s, 8s, 16s, 30s …). A cold API on Render can
// take ~1 minute to wake up. allow404: return null for a genuine 404 instead of retrying.
async function getJson(path, { allow404 = false } = {}) {
  const url = `${API_HOST}${path}`
  let lastError
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: 'application/json' } })
      if (res.status === 404 && allow404) return null
      if (res.ok) return await res.json()
      lastError = new Error(`HTTP ${res.status}`)
      // Other 4xx won't fix themselves — don't wait for them.
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) break
    } catch (err) {
      lastError = err
    }
    if (attempt < ATTEMPTS) {
      const wait = Math.min(2000 * 2 ** (attempt - 1), 30_000)
      console.warn(`prerender: ${path} attempt ${attempt}/${ATTEMPTS} failed (${lastError.message}); retrying in ${wait / 1000}s`)
      await sleep(wait)
    }
  }
  fail(`could not fetch ${url} (${lastError?.message})`)
}

// Run fn over items, `limit` at a time.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i], i)
    }
  }))
  return results
}

// ── 1. Data ─────────────────────────────────────────────────────────────────────────────────
// The first request also wakes a sleeping API; the retries above give it time.
console.log(`prerender: fetching data from ${API_HOST}`)
const categories = {}
for (const type of ['Emotion', 'Festival', 'Occasion']) {
  categories[type] = await getJson(`/api/categories?type=${type}`)
}
const products = await getJson('/api/products')
const posts = await getJson('/api/blogposts')

if (!ALLOW_EMPTY) {
  if (products.length === 0) fail('the API returned no products. Set PRERENDER_ALLOW_EMPTY=1 if that is intended.')
  if (categories.Emotion.length === 0) fail('the API returned no Emotion categories. Set PRERENDER_ALLOW_EMPTY=1 if that is intended.')
}

// The detail endpoints are what the pages themselves load, so render with exactly that.
const productDetails = (await mapLimit(products, 4, p => getJson(`/api/products/${encodeURIComponent(p.slug)}`, { allow404: true }))).filter(Boolean)
const postDetails = (await mapLimit(posts, 4, p => getJson(`/api/blogposts/${encodeURIComponent(p.slug)}`, { allow404: true }))).filter(Boolean)

// ── 2. Routes ───────────────────────────────────────────────────────────────────────────────
const shared = { products, posts, categories }
const routes = [
  ...['/', '/about', '/blog', '/emotions', '/festivals', '/occasions'].map(route => ({ route })),
  ...Object.entries(categories).flatMap(([type, list]) =>
    list.map(c => ({ route: `/${type.toLowerCase()}s/${c.slug}` }))),
  ...productDetails.map(product => ({ route: `/shop/${product.slug}`, product })),
  ...postDetails.map(post => ({ route: `/blog/${post.slug}`, post, lastmod: post.publishedAt?.slice(0, 10) })),
]

// ── 3. Render ───────────────────────────────────────────────────────────────────────────────
const { render } = await import(pathToFileURL(SSR_ENTRY).href)
const template = readFileSync(join(DIST, 'index.html'), 'utf8')

const escapeAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escapeText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// JSON inside <script>: "<" escaped so content can never close the tag early.
const safeJson = obj => JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

function headTags(seo) {
  const tags = []
  if (seo.noindex) tags.push('<meta name="robots" content="noindex" />')
  if (seo.canonical) tags.push(`<link rel="canonical" href="${escapeAttr(seo.canonical)}" />`)
  for (const [property, content] of Object.entries(seo.og ?? {})) {
    tags.push(`<meta property="${property}" content="${escapeAttr(content)}" />`)
  }
  tags.push('<meta name="twitter:card" content="summary_large_image" />')
  return tags.join('\n    ')
}

function page({ seo, html: rendered = '', preload = null }) {
  // React emits resource hints (<link rel="preload" as="image" …> for the logo and above-the-fold
  // product images) at the start of its output. They belong in <head>, where they start the
  // downloads early, and must not sit inside #root where React expects only the app's markup.
  const hints = rendered.match(/^(?:<link [^>]*\/>)+/)?.[0] ?? ''
  const html = rendered.slice(hints.length)
  let out = template.replace('</head>', () => (hints ? `  ${hints}\n  </head>` : '</head>'))
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeText(seo.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${escapeAttr(seo.description)}" />\n    ${headTags(seo)}`)
  const data = preload ? `\n    <script type="application/json" id="__SNEKART_DATA__">${safeJson(preload)}</script>` : ''
  // Function replacers: page text containing "$&" or "$'" must not be read as replace patterns.
  out = out.replace('<div id="root"></div>', () => `<div id="root">${html}</div>${data}`)
  if (!out.includes(`<title>${escapeText(seo.title)}</title>`) || (html && !out.includes(html))) {
    fail('dist/index.html no longer has the expected <title>, <meta name="description"> or <div id="root"></div>.')
  }
  return out
}

// Render serves "/shop/x" from shop/x.html (after checking its rules), but serves a folder's
// index.html only for "/shop/x/". So each page is written twice:
//   dist/shop/x.html          → /shop/x   (the canonical URL)
//   dist/shop/x/index.html    → /shop/x/  (same page; its canonical points at /shop/x)
// A slug with no files falls through to 404.html with a real 404 — no rewrite rule is needed.
function writePage(route, contents) {
  if (route === '/') {
    writeFileSync(join(DIST, 'index.html'), contents)
    return
  }
  const base = join(DIST, route.slice(1))
  mkdirSync(base, { recursive: true })
  writeFileSync(`${base}.html`, contents)
  writeFileSync(join(base, 'index.html'), contents)
}

const written = []
for (const r of routes) {
  const preload = { route: r.route, ...shared, ...(r.product && { product: r.product }), ...(r.post && { post: r.post }) }
  const { html, seo } = await render(r.route, preload)
  if (!seo) fail(`${r.route} rendered without a <Seo> component.`)
  if (seo.noindex) fail(`${r.route} rendered as "not found" — its data didn't match the route.`)
  if (!/<h1[\s>]/.test(html)) fail(`${r.route} has no <h1> in its rendered HTML.`)
  writePage(r.route, page({ seo, html, preload }))
  written.push({ ...r, seo })
}

// "Not found" page — Render serves /404.html with status 404 for any path without a file/rule.
// No preload: the browser always renders it fresh, so a product added after this build (whose
// URL lands here until the next deploy) still shows the real product to visitors.
{
  const { html, seo } = await render('/__snekart-not-found__', { route: null })
  if (!seo?.noindex) fail('the "not found" page is missing noindex.')
  writeFileSync(join(DIST, '404.html'), page({ seo, html }))
}

// App shell for client-only pages (cart, checkout, login, register, my-orders, order-confirmation,
// admin). Empty body; noindex so it is never indexed even if robots.txt is ignored.
writeFileSync(join(DIST, 'app-shell.html'), page({
  seo: { title: 'Snekart', description: 'Snekart – gift hampers delivered across Lucknow.', noindex: true, canonical: null, og: {} },
}))

// ── 4. Sitemap: exactly the pages just written (all canonical, all 200) ─────────────────────
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.map(w => `  <url><loc>${SITE}${w.route}</loc>${w.lastmod ? `<lastmod>${w.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)

// ── 5. Report ───────────────────────────────────────────────────────────────────────────────
const titles = new Map()
for (const w of written) titles.set(w.seo.title, [...(titles.get(w.seo.title) ?? []), w.route])
for (const [title, list] of titles) {
  if (list.length > 1) console.warn(`prerender: WARNING duplicate title "${title}" on ${list.join(', ')}`)
}
for (const w of written.filter(w => w.product)) {
  const n = w.seo.description.length
  if (n < 140 || n > 155) console.warn(`prerender: note — ${w.route} description is ${n} chars (target 140–155)`)
}
console.log(`prerender: wrote ${written.length} pages + 404.html + app-shell.html; sitemap.xml lists ${written.length} URLs`)
