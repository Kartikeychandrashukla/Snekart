import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { getCategories } from '../services/api'
import ProductCard, { Toast, useAddToCart } from '../components/ProductCard'

// Shared shop-by-category page for Emotion / Festival / Occasion — same structure, just
// pointed at a different category type and product tag field.
export default function CategoryShop({ type, field, title, subtitle }) {
  const [searchParams] = useSearchParams()
  const navigate        = useNavigate()
  const { products }    = useProducts()
  const { handleAdd, toast, clearToast } = useAddToCart()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getCategories(type).then(setCategories)
  }, [type])

  const active   = searchParams.get('c') || 'all'
  // "All X" means "every product tagged with at least one X" — not literally every product.
  // This matters because Festival/Occasion tags are optional (unlike Emotion, which every
  // product must have at least one of), so an untagged product shouldn't show up here.
  const filtered = active === 'all'
    ? products.filter(p => p[field]?.length > 0)
    : products.filter(p => p[field]?.includes(active))

  const activeCategory = categories.find(c => c.slug === active)

  function selectCategory(slug) {
    navigate(slug === active ? `/${type.toLowerCase()}s` : `/${type.toLowerCase()}s?c=${slug}`)
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <h1 className="text-3xl font-bold text-forest mb-1">{title}</h1>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

        {/* Category selector */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-10">
            <button
              onClick={() => navigate(`/${type.toLowerCase()}s`)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                active === 'all'
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
              }`}
            >
              All {type}s
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => selectCategory(c.slug)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  active === c.slug
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Section title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-forest">
              {activeCategory ? `Kits for ${activeCategory.name}` : `All ${type} Kits`}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {filtered.length} kit{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>
          {active !== 'all' && (
            <button
              onClick={() => navigate(`/${type.toLowerCase()}s`)}
              className="text-xs text-forest border border-forest px-3 py-1.5 rounded-full hover:bg-forest hover:text-white transition-colors"
            >
              Clear filter
            </button>
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
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast name={toast} onClose={clearToast} />}
    </div>
  )
}
