import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

// Shown for any URL that isn't a page (App.jsx catch-all route) and for unknown
// /festivals|occasions|emotions/:slug pages. The build also renders it as dist/404.html, which
// the host serves with a real 404 status for any URL that has no page.
export default function NotFound() {
  return (
    <div className="bg-cream min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <Seo
        title="Page not found – Snekart"
        description="This page doesn't exist. Browse Snekart gift hampers delivered across Lucknow."
        noindex
      />
      <h1 className="text-forest font-bold text-3xl">Page not found</h1>
      <p className="text-gray-400 max-w-md">
        This page doesn't exist or has moved. Try one of these instead:
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <Link to="/" className="bg-forest text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-forest/90 transition-colors">
          Home
        </Link>
        <Link to="/festivals" className="text-sm text-forest border border-forest px-5 py-2.5 rounded-xl hover:bg-forest hover:text-white transition-colors">
          Festival gifts
        </Link>
        <Link to="/occasions" className="text-sm text-forest border border-forest px-5 py-2.5 rounded-xl hover:bg-forest hover:text-white transition-colors">
          Occasion gifts
        </Link>
        <Link to="/blog" className="text-sm text-forest border border-forest px-5 py-2.5 rounded-xl hover:bg-forest hover:text-white transition-colors">
          Blog
        </Link>
      </div>
    </div>
  )
}
