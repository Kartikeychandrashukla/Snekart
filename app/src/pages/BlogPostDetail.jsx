import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBlogPostBySlug } from '../services/api'
import { useProducts } from '../context/ProductsContext'
import ProductCard, { Toast, useAddToCart } from '../components/ProductCard'
import { categoryColor } from './Blog'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogPostDetail() {
  const { slug } = useParams()
  const { products } = useProducts()
  const { handleAdd, toast, clearToast } = useAddToCart()
  const [post,    setPost]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getBlogPostBySlug(slug)
      .then(setPost)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading post...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-gray-400">This post doesn't exist, or has been taken down.</p>
        <Link to="/blog" className="text-forest text-sm font-semibold hover:underline">← Back to the Journal</Link>
      </div>
    )
  }

  const relatedProducts = post.relatedProductIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean)

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-10">

        <Link to="/blog" className="text-gray-400 text-sm hover:text-forest transition-colors">
          ← Back to the Journal
        </Link>

        <div className="mt-6 mb-6">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${categoryColor[post.category] ?? 'bg-taupe text-forest'}`}>
            {post.category}
          </span>
          <h1 className="text-forest font-bold text-3xl md:text-4xl leading-snug mt-4 mb-4">{post.title}</h1>
          <div className="text-gray-400 text-sm">
            {post.author} · {formatDate(post.publishedAt)} · {post.readTime}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden mb-8 h-72 md:h-96">
          {post.video ? (
            <video autoPlay muted playsInline controls src={post.video} className="w-full h-full object-cover" />
          ) : (
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="space-y-5">
          {post.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-600 text-base leading-relaxed">{para}</p>
          ))}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <h2 className="text-forest font-bold text-lg mb-1">A kit for this feeling</h2>
            <p className="text-gray-400 text-sm mb-5">Handpicked to go with what you just read.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        )}

      </div>

      {toast && <Toast name={toast} onClose={clearToast} />}
    </div>
  )
}
