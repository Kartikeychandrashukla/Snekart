import { useSearchParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import ProductCard, { Toast, useAddToCart } from '../components/ProductCard'

const emotions = [
  { id: 'happy',       label: 'Happy' },
  { id: 'loved',       label: 'Loved' },
  { id: 'anxious',     label: 'Anxious' },
  { id: 'sad',         label: 'Sad' },
  { id: 'calm',        label: 'Calm' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
  { id: 'festive',     label: 'Festive' },
  { id: 'occasion',    label: 'Occasion' },
]

const faceSVG = {
  happy:       '😊',
  loved:       '🥰',
  anxious:     '😟',
  sad:         '😢',
  calm:        '😌',
  overwhelmed: '😐',
festive: '🎉',
occasion: '🎁',

}

export default function Emotions() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { products }   = useProducts()
  const { handleAdd, toast, clearToast } = useAddToCart()

  const active   = searchParams.get('e') || 'all'
  const filtered = active === 'all'
    ? products
    : products.filter(p => p.emotion.includes(active))

  const activeEmotion = emotions.find(e => e.id === active)

  function selectEmotion(id) {
    navigate(id === active ? '/emotions' : `/emotions?e=${id}`)
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <h1 className="text-3xl font-bold text-forest mb-1">Shop by Emotion</h1>
          <p className="text-gray-400 text-sm">
            Tell us how you feel. We'll find the right kit.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

        {/* ── Emotion Selector ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {emotions.map(e => (
            <button
              key={e.id}
              onClick={() => selectEmotion(e.id)}
              title={e.label}
              aria-label={e.label}
              className={`bg-white border rounded-2xl px-4 py-6 flex items-center justify-center transition-all duration-200
                ${active === e.id
                  ? 'border-forest ring-1 ring-forest'
                  : 'border-taupe hover:border-forest'
                }`}
            >
              <span className="text-3xl">{faceSVG[e.id]}</span>
            </button>
          ))}
        </div>

        {/* ── Section title ────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-forest">
              {activeEmotion
                ? `Kits for when you feel ${activeEmotion.label}`
                : 'All Kits'}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {filtered.length} kit{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>
          {active !== 'all' && (
            <button
              onClick={() => navigate('/emotions')}
              className="text-xs text-forest border border-forest px-3 py-1.5 rounded-full hover:bg-forest hover:text-white transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onAdd={handleAdd} />
          ))}
        </div>
      </div>

      {toast && <Toast name={toast} onClose={clearToast} />}
    </div>
  )
}
