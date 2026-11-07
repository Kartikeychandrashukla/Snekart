// Writes public/sitemap.xml before each build, listing every public page — static pages plus
// each category, product and blog post fetched from the API. Vite copies public/ into dist/.
// If the API is unreachable the sitemap still gets the static pages, and the build carries on.
import { writeFileSync } from 'node:fs'
import { loadEnv } from 'vite'

const SITE = 'https://snekart.in'
const env = { ...loadEnv(process.env.NODE_ENV || 'production', process.cwd(), ''), ...process.env }
const API = `${env.VITE_API_HOST}/api`

async function getJson(path) {
  try {
    const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(20000) })
    return res.ok ? await res.json() : []
  } catch (err) {
    console.warn(`sitemap: could not fetch ${path} (${err.message})`)
    return []
  }
}

const urls = ['/', '/emotions', '/festivals', '/occasions', '/blog', '/about'].map(path => ({ path }))

for (const type of ['Emotion', 'Festival', 'Occasion']) {
  const categories = await getJson(`/categories?type=${type}`)
  for (const c of categories) urls.push({ path: `/${type.toLowerCase()}s/${c.slug}` })
}

const products = await getJson('/products')
for (const p of products) urls.push({ path: `/shop/${p.slug}` })

const posts = await getJson('/blogposts')
for (const p of posts) urls.push({ path: `/blog/${p.slug}`, lastmod: p.publishedAt?.slice(0, 10) })

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u.path}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`

writeFileSync('public/sitemap.xml', xml)
console.log(`sitemap: wrote ${urls.length} URLs to public/sitemap.xml`)
