import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderById } from '../services/api'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    getOrderById(orderId)
      .then(data => {
        if (!data) setError(true)
        else setOrder(data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-forest font-semibold">Order not found</p>
        <Link to="/shop" className="bg-forest text-white px-6 py-3 rounded-xl text-sm font-medium">
          Go to Shop
        </Link>
      </div>
    )
  }

  const date = new Date(order.placedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="bg-cream min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Success card */}
        <div className="bg-white rounded-2xl border border-taupe p-8 text-center mb-6">
          <div className="w-16 h-16 bg-sage/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-forest mb-2">Order Placed!</h1>
          <p className="text-gray-400 text-sm mb-4">
            Thank you for your order. We'll call you to confirm before dispatch.
          </p>
          <div className="inline-block bg-cream border border-taupe rounded-xl px-5 py-2">
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="text-forest font-bold text-lg tracking-wide">{order.id}</p>
          </div>
          <p className="text-gray-300 text-xs mt-3">Placed on {date}</p>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-taupe p-6 mb-4">
          <h2 className="text-forest font-bold mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0"/>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-forest font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.tierLabel} · Qty: {item.qty}</p>
                </div>
                <p className="text-forest font-bold text-sm shrink-0">
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-taupe mt-5 pt-4 flex justify-between">
            <span className="text-forest font-bold">Total Paid (COD)</span>
            <span className="text-forest font-bold text-lg">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-taupe p-6 mb-6">
          <h2 className="text-forest font-bold mb-3">Delivering To</h2>
          <p className="text-forest font-semibold text-sm">{order.name}</p>
          <p className="text-gray-400 text-sm mt-0.5">{order.phone}</p>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">
            {order.addressLine}, {order.city}, {order.state} — {order.pincode}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sage text-xs font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
            </svg>
            Estimated delivery: 5–7 business days
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/shop" className="flex-1 bg-forest text-white text-center font-semibold py-3.5 rounded-xl hover:bg-forest/90 transition-colors">
            Continue Shopping
          </Link>
          <Link to="/" className="flex-1 bg-white border border-taupe text-forest text-center font-semibold py-3.5 rounded-xl hover:bg-cream transition-colors">
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  )
}
