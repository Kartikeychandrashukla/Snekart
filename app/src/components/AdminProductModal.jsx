import { useState } from 'react'
import { createProduct, updateProduct, deleteProduct, uploadProductImage, deleteUploadedImage } from '../services/api'

const emotionOptions = ['happy', 'loved', 'anxious', 'sad', 'calm', 'overwhelmed']
const tierOptions = [
  { value: 1, label: 'Starter Kit (₹399–599)' },
  { value: 2, label: 'Core Kit (₹799–1,299)' },
  { value: 3, label: 'Premium Kit (₹1,999–5,000)' },
]

const MAX_GALLERY_IMAGES = 4 // plus 1 primary image = 5 total

function toFormState(product) {
  return {
    name:        product?.name ?? '',
    slug:        product?.slug ?? '',
    tier:        product?.tier ?? 1,
    price:       product?.price ?? '',
    costPrice:   product?.costPrice ?? '',
    description: product?.description ?? '',
    items:       product?.items?.join('\n') ?? '',
    emotion:     product?.emotion ?? [],
    image:       product?.image ?? '',
    images:      product?.images ?? [],
    badge:       product?.badge ?? '',
    inStock:     product?.inStock ?? true,
  }
}

export default function AdminProductModal({ product, onClose, onSaved, onToast }) {
  const isEdit = !!product
  const [form, setForm] = useState(toFormState(product))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      setField('image', url)
    } catch (err) {
      onToast?.(err.message, 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleGalleryFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingGallery(true)
    try {
      const url = await uploadProductImage(file)
      setForm(f => ({ ...f, images: [...f.images, url] }))
    } catch (err) {
      onToast?.(err.message, 'error')
    } finally {
      setUploadingGallery(false)
      e.target.value = ''
    }
  }

  async function removePrimaryImage() {
    const url = form.image
    setField('image', '')
    try {
      await deleteUploadedImage(url)
    } catch (err) {
      onToast?.(err.message, 'error')
    }
  }

  async function removeGalleryImage(index) {
    const url = form.images[index]
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
    try {
      await deleteUploadedImage(url)
    } catch (err) {
      onToast?.(err.message, 'error')
    }
  }

  function toggleEmotion(e) {
    setForm(f => ({
      ...f,
      emotion: f.emotion.includes(e) ? f.emotion.filter(x => x !== e) : [...f.emotion, e],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.price || form.emotion.length === 0) {
      setError('Name, price, and at least one emotion are required.')
      return
    }

    const payload = {
      tier:        Number(form.tier),
      name:        form.name.trim(),
      slug:        form.slug.trim(),
      emotion:     form.emotion,
      price:       Number(form.price),
      costPrice:   Number(form.costPrice) || 0,
      description: form.description.trim(),
      items:       form.items.split('\n').map(s => s.trim()).filter(Boolean),
      image:       form.image.trim(),
      images:      form.images.map(s => s.trim()).filter(Boolean),
      badge:       form.badge.trim() || null,
      inStock:     form.inStock,
    }

    setSaving(true)
    try {
      const result = isEdit
        ? await updateProduct(product.id, payload)
        : await createProduct(payload)
      onToast?.(result.message, 'success')
      await onSaved()
      onClose()
    } catch (err) {
      onToast?.(err.message, 'error')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      const result = await deleteProduct(product.id)
      onToast?.(result.message, 'success')
      await onSaved()
      onClose()
    } catch (err) {
      onToast?.(err.message, 'error')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-lg shadow-xl my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-forest font-bold text-lg">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-forest transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Slug (optional — auto-generated from name if blank)</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => setField('slug', e.target.value)}
              placeholder="e.g. exam-survival-kit"
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tier</label>
              <select
                value={form.tier}
                onChange={e => setField('tier', e.target.value)}
                className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors"
              >
                {tierOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Badge (optional)</label>
              <input
                type="text"
                value={form.badge}
                onChange={e => setField('badge', e.target.value)}
                placeholder="e.g. Best Seller"
                className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setField('price', e.target.value)}
                className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Cost Price (₹)</label>
              <input
                type="number"
                value={form.costPrice}
                onChange={e => setField('costPrice', e.target.value)}
                className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              rows={2}
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Items (one per line)</label>
            <textarea
              value={form.items}
              onChange={e => setField('items', e.target.value)}
              rows={4}
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Image</label>
            <div className="flex items-center gap-3">
              {form.image && (
                <div className="relative w-14 h-14 shrink-0">
                  <img
                    src={form.image}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border border-taupe"
                  />
                  <button
                    type="button"
                    onClick={removePrimaryImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-forest text-white text-xs leading-none flex items-center justify-center hover:bg-forest/90 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label className="flex-1 cursor-pointer">
                <span className={`block text-center text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                  uploading
                    ? 'bg-cream border-taupe text-gray-300 cursor-wait'
                    : 'bg-cream border-taupe text-forest hover:border-forest'
                }`}>
                  {uploading ? 'Uploading...' : form.image ? 'Change Image' : 'Upload Image'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={form.image}
              onChange={e => setField('image', e.target.value)}
              placeholder="or paste an image URL"
              className="w-full mt-2 bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Gallery Images ({form.images.length}/{MAX_GALLERY_IMAGES}) — shown as additional photos on the product page
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {form.images.map((img, i) => (
                <div key={img + i} className="relative w-14 h-14 shrink-0">
                  <img
                    src={img}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border border-taupe"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-forest text-white text-xs leading-none flex items-center justify-center hover:bg-forest/90 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {form.images.length < MAX_GALLERY_IMAGES && (
                <label className="cursor-pointer">
                  <span className={`block text-center text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                    uploadingGallery
                      ? 'bg-cream border-taupe text-gray-300 cursor-wait'
                      : 'bg-cream border-taupe text-forest hover:border-forest'
                  }`}>
                    {uploadingGallery ? 'Uploading...' : '+ Add Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleGalleryFileChange}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Emotions</label>
            <div className="flex gap-2 flex-wrap">
              {emotionOptions.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEmotion(e)}
                  className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
                    form.emotion.includes(e)
                      ? 'bg-forest text-white border-forest'
                      : 'bg-cream text-gray-400 border-taupe hover:border-forest hover:text-forest'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={e => setField('inStock', e.target.checked)}
              className="accent-forest"
            />
            In stock
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading || uploadingGallery}
              className="flex-1 bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 text-sm hover:text-forest transition-colors px-4 py-3"
            >
              Cancel
            </button>
          </div>

          {isEdit && (
            <div className="pt-3 border-t border-taupe">
              {confirmDelete ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-red-400">Delete this product permanently?</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="text-xs bg-red-400 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-gray-400 hover:text-forest transition-colors px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-red-400 hover:text-red-500 transition-colors"
                >
                  Delete Product
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
