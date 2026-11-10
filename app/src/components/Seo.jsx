import { useEffect } from 'react'

export default function Seo({ title, description, noindex = false }) {
  useEffect(() => {
    // Change the text in the browser tab / Google link
    document.title = title

    // Change the grey description text
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
  }, [title, description])

  // "Not found" pages: tell Google not to index them. Our host answers every unknown URL
  // with 200 + index.html, so without this a wrong URL looks like a real page (a "soft 404").
  // The tag is removed again when the user navigates away.
  useEffect(() => {
    if (!noindex) return
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [noindex])

  return null // shows nothing on screen
}
