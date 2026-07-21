import { useEffect, useState } from 'react'
import { getProductReviews, createReview, deleteReview, uploadReviewImage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ReviewImageDialog from './ReviewImageDialog'

const MAX_REVIEW_IMAGES = 4

export default function ReviewsSection({ slug }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ customerName: '', rating: 5, comment: '', images: [] })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [showReviews, setShowReviews] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
const { isAdmin } = useAuth()

async function handleImageFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  setUploading(true)
  try {
    const url = await uploadReviewImage(file)
    setForm(f => ({ ...f, images: [...f.images, url] }))
  } catch (err) {
    setError(err.message)
  } finally {
    setUploading(false)
    e.target.value = ''
  }
}

function removeReviewImage(index) {
  setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
}

async function handleDelete(reviewId) {
  await deleteReview(slug, reviewId)
  setReviews(reviews.filter(r => r.id !== reviewId))
}

 useEffect(() => {
  if (!showReviews) return
  setLoading(true)
  getProductReviews(slug)
    .then(setReviews)
    .finally(() => setLoading(false))
}, [slug, showReviews])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { review } = await createReview(slug, form)
      setReviews([review, ...reviews])
      setForm({ customerName: '', rating: 5, comment: '', images: [] })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-16">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-forest font-bold text-lg">Reviews</h2>
        <button
          onClick={() => setShowReviews(!showReviews)}
          title={showReviews ? 'Hide reviews' : 'Show reviews'}
          className="text-gray-400 hover:text-forest transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            {showReviews ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </>
            )}
          </svg>
        </button>
      </div>

      {showReviews && (
        <>
          {avgRating && (
            <p className="text-gray-400 text-sm mb-5">
              {avgRating} ★ average · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          )}

          {loading ? (
            <p className="text-gray-400 text-sm">Loading reviews...</p>
          ) : (
            <div className="space-y-4 mb-8">
              {reviews.length === 0 && (
                <p className="text-gray-400 text-sm">No reviews yet — be the first.</p>
              )}
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-taupe p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-forest font-semibold text-sm">{r.customerName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-warm text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete review"
                          className="text-gray-300 hover:text-red-400 transition-colors text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">{r.comment}</p>
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {r.images.map((img, i) => (
                        <img
                          key={img + i}
                          src={img}
                          alt=""
                          onClick={() => setPreviewImage({ url: img, review: r })}
                          className="w-14 h-14 rounded-lg object-cover border border-taupe cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-taupe p-4 space-y-3 max-w-md">
            <h3 className="text-forest font-semibold text-sm">Write a review</h3>
            <input
              type="text"
              placeholder="Your name"
              value={form.customerName}
              onChange={e => setForm({ ...form, customerName: e.target.value })}
              required
              className="w-full border border-taupe rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={form.rating}
              onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
              className="w-full border border-taupe rounded-lg px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <textarea
              placeholder="Your review"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              required
              className="w-full border border-taupe rounded-lg px-3 py-2 text-sm"
              rows={3}
            />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Photos ({form.images.length}/{MAX_REVIEW_IMAGES})
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={img + i} className="relative w-14 h-14 shrink-0">
                    <img
                      src={img}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover border border-taupe"
                    />
                    <button
                      type="button"
                      onClick={() => removeReviewImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-forest text-white text-xs leading-none flex items-center justify-center hover:bg-forest/90 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {form.images.length < MAX_REVIEW_IMAGES && (
                  <label className="cursor-pointer">
                    <span className={`block text-center text-xs px-3 py-2 rounded-lg border transition-colors ${
                      uploading
                        ? 'border-taupe text-gray-300 cursor-wait'
                        : 'border-taupe text-forest hover:border-forest'
                    }`}>
                      {uploading ? 'Uploading...' : '+ Add Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleImageFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="bg-forest text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-forest/90 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </>
      )}

      {previewImage && (
        <ReviewImageDialog
          image={previewImage.url}
          review={previewImage.review}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  )
}
