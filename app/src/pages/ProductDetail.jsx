import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProductBySlug } from '../services/api'
import { useProducts } from '../context/ProductsContext'
import ProductCard, { Toast, tierStyle, emotionColor, useAddToCart } from '../components/ProductCard'
import ReviewsSection from '../components/ReviewSection';
import ProductImageGallery from '../components/ProductImageGallery'
export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products } = useProducts()
  const { handleAdd, toast, clearToast } = useAddToCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getProductBySlug(slug)
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [slug])

  // Related products come from context (already loaded for the Shop grid) —
  // no extra network round trip just to populate this section.
  const relatedProducts = useMemo(() => {
    if (!product) return []
    return products
      .filter(p => p.id !== product.id && (p.tier === product.tier || p.emotion.some(e => product.emotion.includes(e))))
      .slice(0, 4)
  }, [products, product])

  function handleBuyNow() {
    handleAdd(product)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading kit...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-gray-400">This kit doesn't exist, or has been taken down.</p>
        <Link to="/shop" className="text-forest text-sm font-semibold hover:underline">← Back to Shop</Link>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">

        <Link to="/shop" className="text-gray-400 text-sm hover:text-forest transition-colors">
          ← Back to Shop
        </Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">

          <ProductImageGallery
            key={product.slug}
            images={[product.image, ...(product.images ?? [])]}
            alt={product.name}
          />

          {/* ── Info ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tierStyle[product.tier]}`}>
                {product.tierLabel}
              </span>
              {product.emotion.map(e => (
                <span key={e} className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${emotionColor[e]}`}>
                  {e}
                </span>
              ))}
              {product.badge && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-forest shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="text-forest font-bold text-3xl leading-snug mb-3">{product.name}</h1>
            <p className="text-forest font-bold text-2xl mb-4">₹{product.price.toLocaleString('en-IN')}</p>
            <p className="text-gray-500 text-base leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6">
              <h2 className="text-forest font-semibold text-sm mb-2">What's inside</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{product.items.join(', ')}</p>
            </div>

            {/* TODO(exercise): SpecsTable component — render product.specifications
                (a flat "Key: Value" string list) as a two-column table. */}

            {/* TODO(exercise): SellerInfoCard component — product.sellerName +
                product.sellerRating. */}

            <div className="flex gap-3 mt-auto pt-6">
              <button
                onClick={() => handleAdd(product)}
                disabled={!product.inStock}
                className="flex-1 bg-white border border-forest text-forest font-semibold py-3.5 rounded-xl hover:bg-taupe transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-forest text-white font-semibold py-3.5 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.inStock ? 'Buy Now' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>

        <ReviewsSection slug={slug} />

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-forest font-bold text-lg mb-1">You might also like</h2>
            <p className="text-gray-400 text-sm mb-5">Other kits picked for how you feel.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        )}

      </div>

      {toast && <Toast name={toast} onClose={clearToast} />}
    </div>
  )
}
