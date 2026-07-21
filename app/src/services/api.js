const API_HOST = import.meta.env.VITE_API_HOST;
const BASE_URL = `${API_HOST}/api`

// Central fetch — fires a global event on 401 so RootLayout can redirect.
// A 403 (logged in but not privileged enough) is left for the caller to handle.
async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, credentials: 'include' })
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('snekart:unauthorized'))
  }
  return res
}

// Plain fetch — a 401 here just means "not logged in yet", not an expired
// session, so it must not trigger the global snekart:unauthorized redirect
export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { credentials: 'include' })
  if (!res.ok) throw new Error('not logged in')
  return res.json()
}

export async function getMyOrders() {
  const res = await apiFetch(`${BASE_URL}/orders/my`)
  if (res.status === 401) throw new Error('unauthorized')
  if (!res.ok) return []
  return res.json()
}

// Price/total aren't sent — the server derives both from the Products table so
// a tampered request can't buy anything below its real price
export async function placeOrder({ items, address, paymentMethod = 'COD' }) {
  const res = await apiFetch(`${BASE_URL}/orders`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(i => ({
        id:        String(i.id),
        name:      i.name,
        tierLabel: i.tierLabel,
        image:     i.image,
        qty:       i.qty,
      })),
      address,
      paymentMethod,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to place order')
  return {
    orderId:         data.id,
    placedAt:        data.placedAt,
    total:           data.total,
    items,
    address,
    payment:         paymentMethod,
    status:          'Pending',
    razorpayOrderId: data.razorpayOrderId,
    razorpayKeyId:   data.razorpayKeyId,
  }
}

export async function verifyPayment(orderId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const res = await apiFetch(`${BASE_URL}/orders/${orderId}/verify-payment`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Payment verification failed')
  return data
}

export async function getOrderById(orderId) {
  const res = await apiFetch(`${BASE_URL}/orders/${orderId}`)
  if (!res.ok) return null
  return res.json()
}

export async function getOrders() {
  const res = await apiFetch(`${BASE_URL}/orders`)
  if (!res.ok) return []
  return res.json()
}

export async function updateOrderStatus(orderId, status) {
  const res = await apiFetch(`${BASE_URL}/orders/${orderId}/status`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ status }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update order status')
  return data
}

// The server only includes costPrice (internal margin data) in the response
// when the requester's session cookie belongs to a verified admin
export async function getProducts() {
  const res = await apiFetch(`${BASE_URL}/products`)
  if (!res.ok) return []
  return res.json()
}

export async function getProductBySlug(slug) {
  const res = await apiFetch(`${BASE_URL}/products/${slug}`)
  if (!res.ok) return null
  return res.json()
}

export async function createProduct(product) {
  const res = await apiFetch(`${BASE_URL}/products`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(product),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create product')
  return data
}

export async function updateProduct(id, product) {
  const res = await apiFetch(`${BASE_URL}/products/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(product),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update product')
  return data
}

export async function deleteProduct(id) {
  const res = await apiFetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to delete product')
  return data
}

export async function uploadProductImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch(`${BASE_URL}/uploads/image`, {
    method: 'POST',
    body:   formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to upload image')
  return `${API_HOST}${data.url}`
}

export async function uploadReviewImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch(`${BASE_URL}/uploads/review-image`, {
    method: 'POST',
    body:   formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to upload image')
  return `${API_HOST}${data.url}`
}

export async function uploadBlogVideo(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch(`${BASE_URL}/uploads/video`, {
    method: 'POST',
    body:   formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to upload video')
  return `${API_HOST}${data.url}`
}

// Only uploaded blobs (served from /api/uploads/...) have a DB row to clean
// up — pasted external image/video URLs are left alone since there's
// nothing on our side to delete.
export async function deleteUploadedImage(url) {
  if (!url || !url.includes('/api/uploads/image/')) return
  const id = url.split('/').pop()
  const res = await apiFetch(`${BASE_URL}/uploads/image/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error('Failed to delete image')
}

export async function deleteUploadedVideo(url) {
  if (!url || !url.includes('/api/uploads/video/')) return
  const id = url.split('/').pop()
  const res = await apiFetch(`${BASE_URL}/uploads/video/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error('Failed to delete video')
}

export async function registerCustomer({ name, email, password }) {
  const res = await apiFetch(`${BASE_URL}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Registration failed')
  return data
}

// Plain fetch — a wrong-password 401 here is an expected outcome, not a
// signal that an existing session expired
export async function loginCustomer({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ email, password }),
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Login failed')
  return data
}

export async function logoutCustomer() {
  const res = await apiFetch(`${BASE_URL}/auth/logout`, { method: 'POST' })
  const data = await res.json()
  return data.message
}

export async function getBlogPosts() {
  const res = await apiFetch(`${BASE_URL}/blogposts`)
  if (!res.ok) return []
  return res.json()
}

export async function getBlogPostBySlug(slug) {
  const res = await apiFetch(`${BASE_URL}/blogposts/${slug}`)
  if (!res.ok) return null
  return res.json()
}

export async function createBlogPost(post) {
  const res = await apiFetch(`${BASE_URL}/blogposts`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(post),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create post')
  return data
}

export async function updateBlogPost(id, post) {
  const res = await apiFetch(`${BASE_URL}/blogposts/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(post),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update post')
  return data
}

export async function deleteBlogPost(id) {
  const res = await apiFetch(`${BASE_URL}/blogposts/${id}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to delete post')
  return data
}

export async function getProductReviews(slug) {
  const res = await apiFetch(`${BASE_URL}/products/${slug}/reviews`)
  if (!res.ok) return []
  return res.json()
}

export async function createReview(slug, { customerName, rating, comment, images }) {
  const res = await apiFetch(`${BASE_URL}/products/${slug}/reviews`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ customerName, rating, comment, images: images ?? [] }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to submit review')
  return data
}
export async function deleteReview(slug, reviewId) {
  const res = await apiFetch(`${BASE_URL}/products/${slug}/reviews/${reviewId}`, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to delete review')
  return data
}
