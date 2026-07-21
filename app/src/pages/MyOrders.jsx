import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/api'

const statusColor = {
  Pending:    'bg-warm text-forest',
  Confirmed:  'bg-dusty text-forest',
  Dispatched: 'bg-lavender text-forest',
  Delivered:  'bg-sage text-forest',
}

export default function MyOrders() {
  const { isLoggedIn, customer } = useAuth()
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    getMyOrders()
      .then(orders => { setOrders(orders); setLoading(false) })
      .catch(() => { /* 401 — redirect already fired via apiFetch, keep loading=true so no flash */ })
  }, [isLoggedIn, navigate])

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">

      <div className="bg-white border-b border-taupe">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
          <h1 className="text-3xl font-bold text-forest mb-1">My Orders</h1>
          <p className="text-gray-400 text-sm">Welcome back, {customer?.name}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-forest font-semibold text-lg mb-2">No orders yet</p>
            <p className="text-gray-400 text-sm mb-6">Your orders will appear here after you shop</p>
            <Link to="/shop" className="bg-forest text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-forest/90 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-taupe p-6">

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-forest font-bold font-mono text-sm">{order.id}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[order.status] ?? 'bg-cream text-forest'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex gap-3 mb-4 flex-wrap">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-cream rounded-xl px-3 py-2">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover"/>
                      )}
                      <div>
                        <p className="text-forest text-xs font-semibold">{item.name}</p>
                        <p className="text-gray-400 text-xs">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-taupe">
                  <p className="text-forest font-bold">
                    ₹{order.total?.toLocaleString('en-IN')}
                    <span className="text-gray-400 text-xs font-normal ml-1">COD</span>
                  </p>
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="text-forest text-xs font-semibold hover:underline"
                  >
                    View Details →
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
