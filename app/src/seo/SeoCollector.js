import { createContext } from 'react'

// Only provided during the build-time render (src/entry-server.jsx): <Seo> writes the page's
// tags into this object so scripts/prerender.js can put them in the HTML <head>.
// In the browser there is no provider and <Seo> updates document.head instead.
export const SeoCollectorContext = createContext(null)
