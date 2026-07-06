import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOrders } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const statusColor = {
  Pending:    'bg-warm text-forest',
  Confirmed:  'bg-dusty text-forest',
  Dispatched: 'bg-lavender text-forest',
  Delivered:  'bg-sage text-forest',
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const { isLoggedIn, isAdmin, logout } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      navigate('/', { replace: true })
      return
    }
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [isLoggedIn, isAdmin, navigate])

  function handleLogout() {
    logout()
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-forest text-white">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sage text-sm mt-0.5">{orders.length} total orders</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sage text-sm border border-sage px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-1">No orders yet</p>
            <p className="text-sm">Orders placed on the website will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-taupe overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-taupe bg-cream">
                  <th className="text-left px-6 py-4 text-forest font-semibold">Order ID</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Customer</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Items</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Total</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Status</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Date</th>
                  <th className="px-6 py-4"/>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id} className={`border-b border-taupe last:border-0 hover:bg-cream/50 transition-colors ${i % 2 === 0 ? '' : 'bg-cream/30'}`}>
                    <td className="px-6 py-4 font-mono text-forest font-semibold text-xs">{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-forest font-medium">{order.name}</p>
                      <p className="text-gray-400 text-xs">{order.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{order.items?.length} kit{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4 text-forest font-semibold">₹{order.total?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[order.status] || 'bg-taupe text-forest'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${order.id}`} className="text-forest text-xs font-semibold hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
