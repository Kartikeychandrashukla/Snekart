// Shared SEO rules: one place decides the official URL of a page and how long a meta
// description may be. Used by <Seo> (browser + build-time render) and the prerender script.
import heroImage from '../assets/hero.jpeg'

// The only official version of the site: https, no www.
export const SITE = 'https://snekart.in'

export const DESCRIPTION_MAX = 155

// "/about/" and "/about?utm_source=x" are the same page as "/about". The homepage keeps its "/".
export function canonicalPath(pathname = '/') {
  const path = pathname.split(/[?#]/)[0].replace(/\/{2,}/g, '/').replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function canonicalUrl(pathname) {
  return `${SITE}${canonicalPath(pathname)}`
}

// Social previews need an absolute image URL. Images uploaded through the admin are already
// absolute (https://api.snekart.in/api/uploads/...); bundled assets are site-relative.
export function absoluteUrl(url) {
  if (!url) return `${SITE}${heroImage}`
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE}${url.startsWith('/') ? '' : '/'}${url}`
}

function clean(text) {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

// Cut at a word boundary so the description never ends mid-word.
function truncateWords(text, max) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–-]+$/, '')}…`
}

// Whole sentences from the start of `text` that fit in `max` characters ('' if even the first
// sentence is too long).
function leadingSentences(text, max) {
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? []
  let out = ''
  for (const s of sentences) {
    const next = `${out} ${s.trim()}`.trim()
    if (next.length > max) break
    out = next
  }
  return out
}

// Any description, capped at ~155 characters.
export function clampDescription(text, max = DESCRIPTION_MAX) {
  const c = clean(text)
  return leadingSentences(c, max) || truncateWords(c, max)
}

// "MINI DRY FRUITS HAMPER" → "Mini Dry Fruits Hamper" (some product names are typed in caps).
function readableName(name) {
  const n = clean(name)
  return n === n.toUpperCase() ? n.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase()) : n
}

const tagName = slug => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

// Product meta description: a 140–155 character summary built from the product's own data —
// its opening sentence(s), what's inside, and where it's delivered — never the full description.
// Products with little or no description fall back to name, price and occasion/festival tags.
export function productDescription(product, max = DESCRIPTION_MAX) {
  const min = 140
  const description = clean(product?.description)
  const endings = [' Delivered across Lucknow by Snekart.', ' Gift delivery across Lucknow.', ' Delivered in Lucknow.', '']
  const shortest = endings[2].length

  // Whole sentences, leaving room for a delivery ending if possible.
  let body = leadingSentences(description, max - shortest) || leadingSentences(description, max)
  // Opening sentence longer than the limit: use it alone, trimmed at a word.
  if (!body && description) return truncateWords(description, max)
  const add = text => { if ((`${body} ${text}`).trim().length + shortest <= max) body = `${body} ${text}`.trim() }

  const name = readableName(product?.name)
  if (!body) {
    // No description at all: say what the product is.
    const price = Number(product?.price) > 0 ? `, ₹${Number(product.price).toLocaleString('en-IN')}` : ''
    body = `${name} – a curated gift hamper from Snekart${price}.`
  }

  // "Includes …" from the item list, as many items as fit.
  const items = (product?.items ?? [])
    .map(i => clean(i.split(/\s[—–-]\s/)[0]))
    .filter(i => i && !/^what'?s\s+inside:?$/i.test(i)) // a heading typed in as an item
  for (let n = items.length; n > 0; n--) {
    const before = body
    add(`Includes ${items.slice(0, n).join(', ')}.`)
    if (body !== before) break
  }

  // Still short and the copy never names the product: lead with its name.
  const named = `${name}: ${body}`
  if (body.length < min - shortest && !body.toLowerCase().includes(name.toLowerCase()) && named.length + shortest <= max) {
    body = named
  }

  // Still short: the occasions/festivals it's tagged for.
  const tags = [...(product?.occasion ?? []), ...(product?.festival ?? [])].map(tagName)
  for (let n = tags.length; n > 0 && body.length < min - shortest; n--) {
    const before = body
    add(`Perfect for ${tags.slice(0, n).join(', ')}.`)
    if (body !== before) break
  }

  // Longest delivery ending that still fits.
  return body + (endings.find(e => (body + e).length <= max) ?? '')
}
