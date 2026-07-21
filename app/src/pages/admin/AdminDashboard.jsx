import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOrders } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useBlog } from '../../context/BlogContext'
import AdminBlogModal from '../../components/AdminBlogModal'
import StatusToast from '../../components/Toast'

const statusColor = {
  Pending:    'bg-warm text-forest',
  Confirmed:  'bg-dusty text-forest',
  Dispatched: 'bg-lavender text-forest',
  Delivered:  'bg-sage text-forest',
}

const paymentStatusColor = {
  COD:     'bg-taupe text-forest',
  Pending: 'bg-warm text-forest',
  Paid:    'bg-sage text-forest',
}

export default function AdminDashboard() {
  const navigate  = useNavigate()
  const { isLoggedIn, isAdmin, logout } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('orders')

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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[{ key: 'orders', label: 'Orders' }, { key: 'blog', label: 'Blog Posts' }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                tab === t.key
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'blog' ? (
          <AdminBlogPanel />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-1">No orders yet</p>
            <p className="text-sm">Orders placed on the website will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-taupe overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-taupe bg-cream">
                  <th className="text-left px-6 py-4 text-forest font-semibold">Order ID</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Customer</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Items</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Total</th>
                  <th className="text-left px-6 py-4 text-forest font-semibold">Payment</th>
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
                      <p className="text-gray-500 text-xs mb-1">{order.paymentMethod === 'Razorpay' ? 'Online' : 'COD'}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentStatusColor[order.paymentStatus] || 'bg-taupe text-forest'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
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

function AdminBlogPanel() {
  const { posts, loading, refetch } = useBlog()
  const [editingPost, setEditingPost] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null) // { message, type }

  function showToast(message, type) {
    setToast({ message, type })
  }

  if (loading) {
    return <p className="text-gray-400 text-sm text-center py-20">Loading posts...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-400 text-sm">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-forest text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-forest/90 transition-colors"
        >
          + New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-1">No posts yet</p>
          <p className="text-sm">Published posts will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-taupe overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-taupe bg-cream">
                <th className="text-left px-6 py-4 text-forest font-semibold">Title</th>
                <th className="text-left px-6 py-4 text-forest font-semibold">Category</th>
                <th className="text-left px-6 py-4 text-forest font-semibold">Published</th>
                <th className="text-left px-6 py-4 text-forest font-semibold">Read Time</th>
                <th className="px-6 py-4"/>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} className={`border-b border-taupe last:border-0 hover:bg-cream/50 transition-colors ${i % 2 === 0 ? '' : 'bg-cream/30'}`}>
                  <td className="px-6 py-4 text-forest font-medium">{post.title}</td>
                  <td className="px-6 py-4 text-gray-500">{post.category}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{post.readTime}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="text-forest text-xs font-semibold hover:underline"
                    >
                      Edit →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <StatusToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showAddModal && (
        <AdminBlogModal
          onClose={() => setShowAddModal(false)}
          onSaved={refetch}
          onToast={showToast}
        />
      )}

      {editingPost && (
        <AdminBlogModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={refetch}
          onToast={showToast}
        />
      )}
    </div>
  )
}
