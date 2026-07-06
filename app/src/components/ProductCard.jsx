import { useState } from 'react'
import { useCart } from '../context/CartContext'

// ── Shared style maps ─────────────────────────────────────────────────────────
export const tierStyle = {
  1: 'bg-warm text-forest',
  2: 'bg-sage text-forest',
  3: 'bg-forest text-white',
}

export const emotionColor = {
  happy:       'bg-warm/60 text-forest',
  loved:       'bg-peach/60 text-forest',
  anxious:     'bg-lavender/80 text-forest',
  sad:         'bg-dusty/80 text-forest',
  calm:        'bg-sage/60 text-forest',
  overwhelmed: 'bg-taupe text-forest',
}

// ── Hook — lives in parent pages only ────────────────────────────────────────
export function useAddToCart() {
  const { addToCart } = useCart()
  const [toast, setToast] = useState(null)

  function handleAdd(product) {
    addToCart(product)
    setToast(product.name)
    setTimeout(() => setToast(null), 3000)
  }

  return { handleAdd, toast, clearToast: () => setToast(null) }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ name, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-forest text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
      <svg className="w-5 h-5 text-sage shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
      </svg>
      <span><span className="font-semibold">{name}</span> added to cart</span>
      <button onClick={onClose} className="ml-2 text-sage hover:text-white transition-colors">✕</button>
    </div>
  )
}

// ── ProductCard — onAdd comes from parent ─────────────────────────────────────
export default function ProductCard({ product, onAdd, isAdmin, onEdit }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">

      <div className="relative h-52 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-white text-forest text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {product.badge}
          </span>
        )}
        {isAdmin && (
          <button
            onClick={() => onEdit(product)}
            title="Edit product"
            className="absolute top-3 right-3 bg-white text-forest w-8 h-8 rounded-full shadow-sm flex items-center justify-center hover:bg-forest hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tierStyle[product.tier]}`}>
            {product.tierLabel}
          </span>
          {product.emotion.map(e => (
            <span key={e} className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${emotionColor[e]}`}>
              {e}
            </span>
          ))}
        </div>

        <h3 className="text-forest font-semibold text-base mb-1 leading-snug">{product.name}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mb-2 flex-1">{product.description}</p>
        <p className="text-gray-300 text-xs mb-3 line-clamp-2">
          <span className="font-medium text-gray-400">Includes:</span> {product.items.join(', ')}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-taupe">
          <span className="text-forest font-bold text-lg">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => onAdd(product)}
            disabled={!product.inStock}
            className="bg-forest text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}
