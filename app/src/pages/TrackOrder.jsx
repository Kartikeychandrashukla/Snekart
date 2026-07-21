import { useState } from 'react'
import { getOrderById } from '../services/api'

const statusColor = {
  Pending:    'bg-warm text-forest',
  Confirmed:  'bg-dusty text-forest',
  Dispatched: 'bg-lavender text-forest',
  Delivered:  'bg-sage text-forest',
}

const statusStep = { Pending: 0, Confirmed: 1, Dispatched: 2, Delivered: 3 }

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!orderId.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)

    const data = await getOrderById(orderId.trim())
    if (!data) setError('No order found with this ID. Please check and try again.')
    else setOrder(data)
    setLoading(false)
  }

  const currentStep = order ? statusStep[order.status] ?? 0 : 0

  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 text-center">
          <h1 className="text-3xl font-bold text-forest mb-2">Track Your Order</h1>
          <p className="text-gray-400 text-sm">Enter your order ID to see the latest status</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="e.g. SNK-7K2M9XQP4L"
            className="flex-1 bg-white border border-taupe rounded-xl px-4 py-3 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-forest text-white font-semibold px-6 py-3 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-white border border-red-100 rounded-2xl p-6 text-center text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {order && (
          <div className="space-y-5">

            {/* Status progress */}
            <div className="bg-white rounded-2xl border border-taupe p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order ID</p>
                  <p className="text-forest font-bold font-mono">{order.id}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor[order.status]}`}>
                  {order.status}
                </span>
              </div>

              {/* Steps */}
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-taupe z-0"/>
                <div
                  className="absolute top-4 left-0 h-0.5 bg-forest z-0 transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
                {['Pending', 'Confirmed', 'Dispatched', 'Delivered'].map((s, i) => (
                  <div key={s} className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                      ${i <= currentStep ? 'bg-forest border-forest' : 'bg-white border-taupe'}`}>
                      {i <= currentStep
                        ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                          </svg>
                        : <div className="w-2 h-2 rounded-full bg-taupe"/>
                      }
                    </div>
                    <p className={`w-14 sm:w-auto text-center text-[10px] sm:text-xs font-medium ${i <= currentStep ? 'text-forest' : 'text-gray-300'}`}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-taupe p-6">
              <h2 className="text-forest font-bold mb-4">Items</h2>
              <div className="space-y-3">
                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0"/>}
                    <div className="flex-1 min-w-0">
                      <p className="text-forest font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.qty}</p>
                    </div>
                    <p className="text-forest font-bold text-sm">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-taupe mt-4 pt-3 flex justify-between">
                <span className="text-forest font-bold text-sm">Total (COD)</span>
                <span className="text-forest font-bold">₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-taupe p-6">
              <h2 className="text-forest font-bold mb-3">Delivering To</h2>
              <p className="text-forest font-semibold text-sm">{order.name}</p>
              <p className="text-gray-400 text-sm mt-0.5">{order.phone}</p>
              <p className="text-gray-400 text-sm mt-1">{order.addressLine}, {order.city}, {order.state} — {order.pincode}</p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
