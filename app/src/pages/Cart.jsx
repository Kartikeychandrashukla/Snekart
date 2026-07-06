import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const DELIVERY_CHARGE = 80
const FREE_DELIVERY_ABOVE = 2000

export default function Cart() {
  const { items, removeFromCart, updateQty, cartTotal } = useCart()
  const navigate = useNavigate()

  const delivery     = cartTotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE
  const grandTotal   = cartTotal + delivery
  const savings      = delivery === 0 ? DELIVERY_CHARGE : 0

  if (items.length === 0) return <EmptyCart />

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold text-forest">Your Cart</h1>
          <p className="text-gray-400 text-sm mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">

        {/* ── Cart Items ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4">
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onQtyChange={(qty) => updateQty(item.id, qty)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}

          {/* Continue shopping */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-forest text-sm font-medium mt-2 hover:underline"
          >
            <span>←</span> Continue Shopping
          </Link>
        </div>

        {/* ── Order Summary ─────────────────────────────────────────────────── */}
        <div className="lg:w-80 w-full shrink-0 bg-white rounded-2xl border border-taupe p-6 sticky top-20">
          <h2 className="text-forest font-bold text-lg mb-5">Order Summary</h2>

          {/* Line items */}
          <div className="space-y-3 mb-5">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-500">
                <span className="flex-1 pr-2 truncate">{item.name} × {item.qty}</span>
                <span className="font-medium text-forest shrink-0">
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-taupe pt-4 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Delivery */}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery</span>
              {delivery === 0 ? (
                <span className="text-sage font-semibold">FREE</span>
              ) : (
                <span>₹{delivery}</span>
              )}
            </div>

            {/* Free delivery nudge */}
            {delivery > 0 && (
              <p className="text-xs text-peach bg-peach/20 rounded-lg px-3 py-2">
                Add ₹{(FREE_DELIVERY_ABOVE - cartTotal).toLocaleString('en-IN')} more for free delivery
              </p>
            )}

            {/* Savings */}
            {savings > 0 && (
              <p className="text-xs text-sage font-medium">
                🎉 You saved ₹{savings} on delivery!
              </p>
            )}
          </div>

          {/* Grand Total */}
          <div className="border-t border-taupe mt-4 pt-4 flex justify-between items-center">
            <span className="text-forest font-bold text-base">Grand Total</span>
            <span className="text-forest font-bold text-xl">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* COD badge */}
          <div className="mt-4 flex items-center gap-2 bg-cream rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-forest shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>
            </svg>
            <span className="text-forest text-xs font-medium">Cash on Delivery available</span>
          </div>

          {/* Checkout button */}
          <button
            onClick={() => navigate('/checkout')}
            className="w-full mt-5 bg-forest text-white font-semibold py-3.5 rounded-xl hover:bg-forest/90 transition-colors"
          >
            Proceed to Checkout
          </button>

          <p className="text-center text-gray-300 text-xs mt-3">
            Safe & secure checkout
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Cart Item Row ─────────────────────────────────────────────────────────────
function CartItem({ item, onQtyChange, onRemove }) {
  const tierColor = { 1: 'bg-warm', 2: 'bg-sage', 3: 'bg-forest text-white' }

  return (
    <div className="bg-white rounded-2xl border border-taupe p-4 flex gap-4">

      {/* Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierColor[item.tier] || 'bg-taupe'} text-forest`}>
              {item.tierLabel}
            </span>
            <h3 className="text-forest font-semibold text-sm mt-1.5 leading-snug truncate">
              {item.name}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 capitalize">
              {item.emotion?.join(', ')}
            </p>
          </div>

          {/* Remove */}
          <button
            onClick={onRemove}
            className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Price + Qty */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onQtyChange(item.qty - 1)}
              className="w-7 h-7 rounded-full border border-taupe flex items-center justify-center text-forest hover:bg-taupe transition-colors text-sm font-bold"
            >
              −
            </button>
            <span className="text-forest font-semibold text-sm w-4 text-center">{item.qty}</span>
            <button
              onClick={() => onQtyChange(item.qty + 1)}
              className="w-7 h-7 rounded-full border border-taupe flex items-center justify-center text-forest hover:bg-taupe transition-colors text-sm font-bold"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-forest font-bold text-base">
              ₹{(item.price * item.qty).toLocaleString('en-IN')}
            </p>
            {item.qty > 1 && (
              <p className="text-gray-300 text-xs">₹{item.price.toLocaleString('en-IN')} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empty Cart ────────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="bg-cream min-h-screen flex flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="w-24 h-24 bg-taupe rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-sage" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
        </svg>
      </div>
      <div>
        <h2 className="text-forest font-bold text-2xl mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm">Find a kit that speaks to how you feel right now.</p>
      </div>
      <Link
        to="/shop"
        className="bg-forest text-white font-medium px-7 py-3 rounded-xl hover:bg-forest/90 transition-colors"
      >
        Explore Kits
      </Link>
    </div>
  )
}
