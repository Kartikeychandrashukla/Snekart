import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { getCategories } from '../services/api'
import ProductCard, { Toast, useAddToCart, deslugify } from '../components/ProductCard'
import Seo from '../components/Seo'

// Shared shop-by-category page for Emotion / Festival / Occasion — same structure, just
// pointed at a different category type and product tag field.
// /festivals is the "all" view; /festivals/:slug is a landing page for one category.
export default function CategoryShop({ type, field, title, subtitle, seoTitle }) {
  const { slug }       = useParams()
  const [searchParams] = useSearchParams()
  const { products }   = useProducts()
  const { handleAdd, toast, clearToast } = useAddToCart()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories(type).then(setCategories)
  }, [type])

  const basePath = `/${type.toLowerCase()}s`
  const typeLabel = `${type}s`

  // Old filter URLs (/festivals?c=diwali) may be bookmarked or indexed — send them to the clean path.
  const legacySlug = searchParams.get('c')
  if (legacySlug) return <Navigate to={`${basePath}/${legacySlug}`} replace />

  const active = slug || 'all'
  // "All X" means "every product tagged with at least one X" — not literally every product.
  // This matters because Festival/Occasion tags are optional (unlike Emotion, which every
  // product must have at least one of), so an untagged product shouldn't show up here.
  const filtered = active === 'all'
    ? products.filter(p => p[field]?.length > 0)
    : products.filter(p => p[field]?.includes(active))

  const activeCategory = categories.find(c => c.slug === active)
  // Fall back to the slug while categories load, so the heading doesn't flicker.
  const activeName = activeCategory?.name ?? (slug ? deslugify(slug) : null)
  // Landing-page text written in Admin → Categories → Page content (null = auto-generated)
  const content = activeCategory?.content ?? null

  // SEO text: hand-written content wins; otherwise it's built from the categories in the
  // database, so adding a new one in admin (e.g. "Karwa Chauth") is covered automatically.
  const categoryNames = categories.map(c => c.name)
  const nameList = categoryNames.length > 0
    ? `${categoryNames.slice(0, 6).join(', ')} and more`
    : `${type.toLowerCase()} gifting`
  const pageTitle = content?.seoTitle
    ?? (activeName ? `${activeName} Gift Hampers in Lucknow – Snekart` : seoTitle)
  const pageDescription = content?.description
    ?? (activeName
      ? `Shop ${activeName} gift hampers and kits from Snekart, delivered across Lucknow.`
      : `Shop gift hampers for ${nameList}, delivered across Lucknow by Snekart.`)

  const heading = content?.heading ?? (activeName ? `${activeName} Gift Hampers` : title)
  const intro   = content?.intro ?? (activeName ? `Curated ${activeName} kits, delivered across Lucknow.` : subtitle)

  const otherCategories = categories.filter(c => c.slug !== active)

  return (
    <div className="bg-cream min-h-screen">
      <Seo title={pageTitle} description={pageDescription} />

      {/* Header */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-3">
            <Link to="/" className="hover:text-forest">Home</Link>
            <span className="mx-1.5">/</span>
            {activeName ? (
              <>
                <Link to={basePath} className="hover:text-forest">{typeLabel}</Link>
                <span className="mx-1.5">/</span>
                <span className="text-forest">{activeName}</span>
              </>
            ) : (
              <span className="text-forest">{typeLabel}</span>
            )}
          </nav>
          <h1 className="text-3xl font-bold text-forest mb-1">{heading}</h1>
          <p className="text-gray-400 text-sm">{intro}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

        {/* Category selector — real links so search engines can crawl each category page */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-10">
            <Link
              to={basePath}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                active === 'all'
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
              }`}
            >
              All {typeLabel}
            </Link>
            {categories.map(c => (
              <Link
                key={c.id}
                to={c.slug === active ? basePath : `${basePath}/${c.slug}`}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  active === c.slug
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Section title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-forest">
              {activeName ? `Kits for ${activeName}` : `All ${type} Kits`}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {filtered.length} kit{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>
          {active !== 'all' && (
            <Link
              to={basePath}
              className="text-xs text-forest border border-forest px-3 py-1.5 rounded-full hover:bg-forest hover:text-white transition-colors"
            >
              Clear filter
            </Link>
          )}
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No kits found</p>
            <p className="text-sm">Try a different {type.toLowerCase()}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} priority={i < 2} />
            ))}
          </div>
        )}

        {/* Written content */}
        {content?.sections?.length > 0 && (
          <div className="max-w-3xl mt-16 space-y-10">
            {content.sections.map(s => (
              <section key={s.title}>
                <h2 className="text-xl font-bold text-forest mb-3">{s.title}</h2>
                {s.body.split('\n\n').map((para, i) => (
                  <p key={i} className="text-gray-600 text-base leading-relaxed mb-3">{para}</p>
                ))}
              </section>
            ))}
          </div>
        )}

        {/* FAQs */}
        {content?.faqs?.length > 0 && (
          <div className="max-w-3xl mt-14">
            <h2 className="text-xl font-bold text-forest mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {content.faqs.map(f => (
                <details key={f.q} className="bg-white border border-taupe rounded-xl px-5 py-4">
                  <summary className="text-forest font-semibold cursor-pointer">{f.q}</summary>
                  <p className="text-gray-600 text-sm leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related categories */}
        {active !== 'all' && otherCategories.length > 0 && (
          <div className="mt-14 pt-8 border-t border-taupe">
            <h2 className="text-sm font-semibold text-forest mb-3">More {type.toLowerCase()} gifts in Lucknow</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {otherCategories.map(c => (
                <Link key={c.id} to={`${basePath}/${c.slug}`} className="text-sm text-gray-500 hover:text-forest hover:underline">
                  {c.name} Gifts
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast name={toast} onClose={clearToast} />}
    </div>
  )
}
