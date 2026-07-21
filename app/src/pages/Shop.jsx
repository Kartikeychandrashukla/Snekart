import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'
import ProductCard, { Toast, useAddToCart } from '../components/ProductCard'
import AdminProductModal from '../components/AdminProductModal'
import StatusToast from '../components/Toast'

const tiers = [
  { value: 0, label: 'All Kits' },
  { value: 1, label: 'Starter  ₹399–₹599' },
  { value: 2, label: 'Core  ₹799–₹1,299' },
  { value: 3, label: 'Premium  ₹1,999–₹5,000' },
]

const emotions = ['all', 'happy', 'loved', 'anxious', 'sad', 'calm', 'overwhelmed']

export default function Shop() {
  const { products, loading, refetch } = useProducts()
  const { isAdmin: admin } = useAuth()
  const { handleAdd, toast, clearToast } = useAddToCart()
  const [searchParams] = useSearchParams()
  const highlightSlug = searchParams.get('kit')
  const highlightRef = useRef(null)
  const [activeTier,    setActiveTier]    = useState(0)
  const [activeEmotion, setActiveEmotion] = useState('all')
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [statusToast,    setStatusToast]    = useState(null) // { message, type }

  // Scroll the exact kit someone clicked from the homepage into view once it's rendered
  useEffect(() => {
    if (highlightSlug && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightSlug, loading])

  function showStatusToast(message, type) {
    setStatusToast({ message, type })
  }

  const filtered = products.filter(p => {
    const tierMatch    = activeTier === 0 || p.tier === activeTier
    const emotionMatch = activeEmotion === 'all' || p.emotion.includes(activeEmotion)
    return tierMatch && emotionMatch
  })

  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-forest mb-1">Shop All Kits</h1>
            <p className="text-gray-400 text-sm">
              {filtered.length} kit{filtered.length !== 1 ? 's' : ''} — find the one that speaks to how you feel
            </p>
          </div>
          {admin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-forest text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-forest/90 transition-colors shrink-0"
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">

          {/* Tier filter */}
          <div className="flex gap-2 flex-wrap">
            {tiers.map(t => (
              <button
                key={t.value}
                onClick={() => setActiveTier(t.value)}
                className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                  activeTier === t.value
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Emotion filter */}
          <div className="flex gap-2 flex-wrap">
            {emotions.map(e => (
              <button
                key={e}
                onClick={() => setActiveEmotion(e)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                  activeEmotion === e
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-gray-400 border-taupe hover:border-forest hover:text-forest'
                }`}
              >
                {e === 'all' ? 'All Emotions' : e}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">Loading kits...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No kits found</p>
            <p className="text-sm">Try changing the filters above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(p => (
              <div
                key={p.id}
                ref={p.slug === highlightSlug ? highlightRef : null}
                className={p.slug === highlightSlug ? 'ring-2 ring-forest ring-offset-2 rounded-2xl' : ''}
              >
                <ProductCard
                  product={p}
                  onAdd={handleAdd}
                  isAdmin={admin}
                  onEdit={setEditingProduct}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast name={toast} onClose={clearToast} />}
      {statusToast && (
        <StatusToast
          message={statusToast.message}
          type={statusToast.type}
          onClose={() => setStatusToast(null)}
        />
      )}

      {showAddModal && (
        <AdminProductModal
          onClose={() => setShowAddModal(false)}
          onSaved={refetch}
          onToast={showStatusToast}
        />
      )}

      {editingProduct && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={refetch}
          onToast={showStatusToast}
        />
      )}
    </div>
  )
}
