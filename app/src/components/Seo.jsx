
import { useEffect } from 'react'

export default function Seo({ title, description }) {
  useEffect(() => {
    // Change the text in the browser tab / Google link
    document.title = title

    // Change the grey description text
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
  }, [title, description])

  return null // shows nothing on screen
}
