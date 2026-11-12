import { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SeoCollectorContext } from '../seo/SeoCollector'
import { canonicalUrl, clampDescription, absoluteUrl } from '../seo/site'

// Every page's <head> tags come from here: title, description, canonical, Open Graph, robots.
// - Build time: the tags are handed to scripts/prerender.js, which writes them into each
//   page's HTML, so crawlers see them without running JavaScript.
// - Browser: they're applied to document.head, and updated on every in-app navigation.
//
// `noindex` pages ("not found", cart, checkout, login …) get <meta name="robots" content="noindex">
// and no canonical.
export function buildSeoTags({ title, description, noindex = false, image, type = 'website', pathname }) {
  return {
    title,
    description: clampDescription(description),
    noindex,
    canonical: noindex ? null : canonicalUrl(pathname),
    og: {
      'og:title': title,
      'og:description': clampDescription(description),
      'og:image': absoluteUrl(image),
      'og:url': canonicalUrl(pathname),
      'og:type': type,
      'og:site_name': 'Snekart',
    },
  }
}

export default function Seo({ title, description, noindex = false, image, type = 'website' }) {
  const { pathname } = useLocation()
  const collector = useContext(SeoCollectorContext)
  const tags = buildSeoTags({ title, description, noindex, image, type, pathname })

  // Server render only: the innermost/last <Seo> rendered for the route wins.
  if (collector) collector.tags = tags

  const key = JSON.stringify(tags)
  useEffect(() => {
    applyToHead(JSON.parse(key))
  }, [key])

  return null // shows nothing on screen
}

function upsert(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

function setMeta(attr, name, content) {
  const el = upsert(`meta[${attr}="${name}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute(attr, name)
    return m
  })
  el.setAttribute('content', content)
}

function applyToHead(tags) {
  document.title = tags.title
  setMeta('name', 'description', tags.description)

  // Robots: only noindex pages carry the tag; it's removed again on normal pages.
  if (tags.noindex) setMeta('name', 'robots', 'noindex')
  else document.head.querySelector('meta[name="robots"]')?.remove()

  if (tags.canonical) {
    upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link')
      l.rel = 'canonical'
      return l
    }).href = tags.canonical
  } else {
    document.head.querySelector('link[rel="canonical"]')?.remove()
  }

  for (const [property, content] of Object.entries(tags.og)) setMeta('property', property, content)
}
