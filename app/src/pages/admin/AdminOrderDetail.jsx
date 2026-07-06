import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getOrderById, updateOrderStatus } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Toast from '../../components/Toast'

const statuses = ['Pending', 'Confirmed', 'Dispatched', 'Delivered']

const statusColor = {
  Pending:    'bg-warm text-forest',
  Confirmed:  'bg-dusty text-forest',
  Dispatched: 'bg-lavender text-forest',
  Delivered:  'bg-sage text-forest',
}

export default function AdminOrderDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { isLoggedIn, isAdmin } = useAuth()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null) // { message, type }

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      navigate('/', { replace: true })
      return
    }
    getOrderById(id)
      .then(data => { if (!data) navigate('/admin'); else setOrder(data) })
      .finally(() => setLoading(false))
  }, [id, isLoggedIn, isAdmin, navigate])

  async function handleStatusChange(newStatus) {
    setSaving(true)
    try {
      const result = await updateOrderStatus(id, newStatus)
      setOrder(o => ({ ...o, status: newStatus }))
      setToast({ message: result.message, type: 'success' })
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading order...</p>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="bg-forest text-white">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <Link to="/admin" className="text-sage text-xs hover:text-white transition-colors">
              ← All Orders
            </Link>
            <h1 className="text-xl font-bold mt-1">{order.id}</h1>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor[order.status]}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">

        {/* Update Status */}
        <div className="bg-white rounded-2xl border border-taupe p-6">
          <h2 className="text-forest font-bold mb-4">Update Order Status</h2>
          <div className="flex gap-3 flex-wrap">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={saving || order.status === s}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${order.status === s
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
          {saving && <p className="text-gray-400 text-xs mt-3">Saving...</p>}
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl border border-taupe p-6">
          <h2 className="text-forest font-bold mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400 text-xs mb-0.5">Name</p><p className="text-forest font-medium">{order.name}</p></div>
            <div><p className="text-gray-400 text-xs mb-0.5">Phone</p><p className="text-forest font-medium">{order.phone}</p></div>
            <div><p className="text-gray-400 text-xs mb-0.5">Email</p><p className="text-forest font-medium">{order.email}</p></div>
            <div><p className="text-gray-400 text-xs mb-0.5">Pincode</p><p className="text-forest font-medium">{order.pincode}</p></div>
            <div className="sm:col-span-2"><p className="text-gray-400 text-xs mb-0.5">Address</p><p className="text-forest font-medium">{order.addressLine}, {order.city}, {order.state}</p></div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-taupe p-6">
          <h2 className="text-forest font-bold mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0"/>}
                <div className="flex-1 min-w-0">
                  <p className="text-forest font-semibold text-sm">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.tierLabel} · Qty: {item.qty}</p>
                </div>
                <p className="text-forest font-bold text-sm shrink-0">
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-taupe mt-4 pt-4 flex justify-between">
            <span className="text-forest font-bold">Total (COD)</span>
            <span className="text-forest font-bold text-lg">₹{order.total?.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
