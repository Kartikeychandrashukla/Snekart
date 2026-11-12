import { createContext, useContext } from 'react'

// Data fetched at build time by scripts/prerender.js, so pages render with real content
// instead of "Loading…". Shape:
//   { route, products, posts, categories: { Emotion, Festival, Occasion }, product?, post? }
// The same object is embedded in each page as <script id="__SNEKART_DATA__"> so the browser
// starts from exactly what the HTML was rendered with (needed for hydration).
// It's only a head start: contexts and pages still fetch fresh data from the API afterwards.
const PreloadContext = createContext({})

export const PreloadProvider = PreloadContext.Provider

export function usePreload() {
  return useContext(PreloadContext)
}

export const PRELOAD_ELEMENT_ID = '__SNEKART_DATA__'

export function readPreloadFromDocument() {
  const el = document.getElementById(PRELOAD_ELEMENT_ID)
  if (!el) return null
  try {
    return JSON.parse(el.textContent)
  } catch {
    return null
  }
}
