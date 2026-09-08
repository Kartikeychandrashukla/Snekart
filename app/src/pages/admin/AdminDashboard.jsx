import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOrders, getCategories, deleteProduct } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useBlog } from '../../context/BlogContext'
import { useProducts } from '../../context/ProductsContext'
import AdminBlogModal from '../../components/AdminBlogModal'
import AdminProductModal from '../../components/AdminProductModal'
import AdminCategoryModal from '../../components/AdminCategoryModal'
import StatusToast from '../../components/Toast'

const categoryTypes = ['Emotion', 'Festival', 'Occasion']

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
          {[
            { key: 'orders',     label: 'Orders' },
            { key: 'products',   label: 'Products' },
            { key: 'categories', label: 'Categories' },
            { key: 'blog',       label: 'Blog Posts' },
          ].map(t => (
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
        ) : tab === 'products' ? (
          <AdminProductsPanel />
        ) : tab === 'categories' ? (
          <AdminCategoriesPanel />
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

function AdminProductsPanel() {
  const { products, loading, refetch } = useProducts()
  const [editingProduct, setEditingProduct] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function showToast(message, type) {
    setToast({ message, type })
  }

  async function handleDelete(id) {
    setDeleting(true)
    try {
      const result = await deleteProduct(id)
      showToast(result.message, 'success')
      setConfirmDeleteId(null)
      await refetch()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <p className="text-gray-400 text-sm text-center py-20">Loading products...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-400 text-sm">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-forest text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-forest/90 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-1">No products yet</p>
          <p className="text-sm">Add your first kit to get the shop started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-taupe overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-taupe bg-cream">
                <th className="text-left px-6 py-4 text-forest font-semibold">Name</th>
                <th className="text-left px-6 py-4 text-forest font-semibold">Tier</th>
                <th className="text-left px-6 py-4 text-forest font-semibold">Price</th>
                <th className="text-left px-6 py-4 text-forest font-semibold">In Stock</th>
                <th className="px-6 py-4"/>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={`border-b border-taupe last:border-0 hover:bg-cream/50 transition-colors ${i % 2 === 0 ? '' : 'bg-cream/30'}`}>
                  <td className="px-6 py-4 text-forest font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-gray-500">{p.tierLabel}</td>
                  <td className="px-6 py-4 text-forest font-semibold">₹{p.price?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-gray-500">{p.inStock ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4">
                    {confirmDeleteId === p.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-red-400 whitespace-nowrap">Delete?</span>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting}
                          className="text-xs bg-red-400 text-white px-2.5 py-1 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deleting}
                          className="text-xs text-gray-400 hover:text-forest transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="text-forest text-xs font-semibold hover:underline"
                        >
                          Edit →
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="text-red-400 text-xs font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
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
        <AdminProductModal
          onClose={() => setShowAddModal(false)}
          onSaved={refetch}
          onToast={showToast}
        />
      )}

      {editingProduct && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={refetch}
          onToast={showToast}
        />
      )}
    </div>
  )
}

function AdminCategoriesPanel() {
  const [activeType, setActiveType] = useState('Emotion')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)

  function refetch() {
    setLoading(true)
    return getCategories(activeType)
      .then(setCategories)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType])

  function showToast(message, type) {
    setToast({ message, type })
  }

  return (
    <div>
      {/* Type sub-tabs */}
      <div className="flex gap-2 mb-5">
        {categoryTypes.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${
              activeType === t
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-400 text-sm">{categories.length} {activeType.toLowerCase()}{categories.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-forest text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-forest/90 transition-colors"
        >
          + Add {activeType}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-20">Loading...</p>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-1">No {activeType.toLowerCase()}s yet</p>
          <p className="text-sm">Add one to make it selectable on products</p>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setEditingCategory(c)}
              className="text-sm bg-white border border-taupe rounded-full px-4 py-2 text-forest hover:border-forest transition-colors"
            >
              {c.name}
            </button>
          ))}
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
        <AdminCategoryModal
          type={activeType}
          onClose={() => setShowAddModal(false)}
          onSaved={refetch}
          onToast={showToast}
        />
      )}

      {editingCategory && (
        <AdminCategoryModal
          type={activeType}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={refetch}
          onToast={showToast}
        />
      )}
    </div>
  )
}
