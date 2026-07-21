import { useState } from 'react'
import { createBlogPost, updateBlogPost, deleteBlogPost, uploadBlogVideo, uploadProductImage, deleteUploadedImage, deleteUploadedVideo } from '../services/api'
import { useProducts } from '../context/ProductsContext'

const categoryOptions = ['Self-Care', 'Gifting', 'Community', 'New Arrivals', 'Soft Life', 'Main Character Energy', 'Low Energy First Aid']
const emotionOptions = ['happy', 'loved', 'anxious', 'sad', 'calm', 'overwhelmed']

function toFormState(post) {
  return {
    title:             post?.title ?? '',
    slug:              post?.slug ?? '',
    category:          post?.category ?? categoryOptions[0],
    emotion:           post?.emotion ?? [],
    excerpt:           post?.excerpt ?? '',
    content:           post?.content ?? '',
    author:            post?.author ?? 'Snekart Team',
    image:             post?.image ?? '',
    video: post?.video ?? '',
    relatedProductIds: post?.relatedProductIds ?? [],
  }
}

export default function AdminBlogModal({ post, onClose, onSaved, onToast }) {
  const isEdit = !!post
  const { products } = useProducts()
  const [form, setForm] = useState(toFormState(post))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [mediaType, setMediaType] = useState(post?.video ? 'video' : 'image')
  const [uploading, setUploading] = useState(false)

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleVideoFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadBlogVideo(file)
      setField('video', url)
    } catch (err) {
      onToast?.(err.message, 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleImageFileChange(e) {
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

  async function removeImage() {
    const url = form.image
    setField('image', '')
    try {
      await deleteUploadedImage(url)
    } catch (err) {
      onToast?.(err.message, 'error')
    }
  }

  async function removeVideo() {
    const url = form.video
    setField('video', '')
    try {
      await deleteUploadedVideo(url)
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

  function toggleRelatedProduct(id) {
    setForm(f => ({
      ...f,
      relatedProductIds: f.relatedProductIds.includes(id)
        ? f.relatedProductIds.filter(x => x !== id)
        : f.relatedProductIds.length >= 2 ? f.relatedProductIds : [...f.relatedProductIds, id],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError('Title, excerpt, and content are required.')
      return
    }

    const payload = {
      title:             form.title.trim(),
      slug:              form.slug.trim(),
      category:          form.category,
      emotion:           form.emotion,
      excerpt:           form.excerpt.trim(),
      content:           form.content.trim(),
      author:            form.author.trim(),
      image:             mediaType === 'image' ? form.image.trim() : '',
      video:             mediaType === 'video' ? form.video.trim() : '',
      relatedProductIds: form.relatedProductIds,
    }

    setSaving(true)
    try {
      const result = isEdit
        ? await updateBlogPost(post.id, payload)
        : await createBlogPost(payload)
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
      const result = await deleteBlogPost(post.id)
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
          <h2 className="text-forest font-bold text-lg">{isEdit ? 'Edit Post' : 'New Post'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-forest transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Slug (optional — auto-generated from title if blank)</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => setField('slug', e.target.value)}
              placeholder="e.g. why-your-emotions-deserve-a-ritual"
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors"
              >
                {categoryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={e => setField('author', e.target.value)}
                className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={e => setField('excerpt', e.target.value)}
              rows={2}
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Content (separate paragraphs with a blank line — read time is calculated automatically)</label>
            <textarea
              value={form.content}
              onChange={e => setField('content', e.target.value)}
              rows={8}
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-2.5 text-sm text-forest outline-none focus:border-forest transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Media</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  mediaType === 'image'
                    ? 'bg-forest text-white border-forest'
                    : 'bg-cream text-gray-400 border-taupe hover:border-forest hover:text-forest'
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  mediaType === 'video'
                    ? 'bg-forest text-white border-forest'
                    : 'bg-cream text-gray-400 border-taupe hover:border-forest hover:text-forest'
                }`}
              >
                Video
              </button>
            </div>
          </div>

          {mediaType === 'image' && (
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
                      onClick={removeImage}
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
                    onChange={handleImageFileChange}
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
          )}

          {mediaType === 'video' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Video</label>
              {form.video && (
                <div className="relative mb-2">
                  <video
                    controls
                    src={form.video}
                    className="w-full rounded-lg border border-taupe"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-forest text-white text-xs leading-none flex items-center justify-center hover:bg-forest/90 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label className="cursor-pointer block">
                <span className={`block text-center text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                  uploading
                    ? 'bg-cream border-taupe text-gray-300 cursor-wait'
                    : 'bg-cream border-taupe text-forest hover:border-forest'
                }`}>
                  {uploading ? 'Uploading...' : form.video ? 'Change Video' : 'Upload Video'}
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Emotion tags</label>
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

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Related kits (up to 2 — shown at the end of the post)</label>
            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleRelatedProduct(p.id)}
                  disabled={!form.relatedProductIds.includes(p.id) && form.relatedProductIds.length >= 2}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    form.relatedProductIds.includes(p.id)
                      ? 'bg-forest text-white border-forest'
                      : 'bg-cream text-gray-400 border-taupe hover:border-forest hover:text-forest'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Post'}
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
                  <p className="text-xs text-red-400">Delete this post permanently?</p>
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
                  Delete Post
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
