import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBlog } from '../context/BlogContext'

// ── Shared style map — also used by BlogPostDetail ─────────────────────────
export const categoryColor = {
  'Self-Care':             'bg-lavender text-forest',
  'Gifting':               'bg-peach text-forest',
  'Community':             'bg-sage/60 text-forest',
  'New Arrivals':          'bg-taupe text-forest',
  'Soft Life':             'bg-warm text-forest',
  'Main Character Energy': 'bg-forest text-white',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Blog() {
  const { posts, loading } = useBlog()
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...new Set(posts.map(p => p.category))]

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  const [featured, ...rest] = filtered

  return (
    <div className="bg-cream min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-bold text-forest mb-1">The Snekart Journal</h1>
          <p className="text-gray-400 text-sm">
            Thoughts on emotions, self-care, gifting, and building a brand that gives a damn.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">

        {loading ? (
          <p className="text-gray-400 text-center py-20">Loading posts...</p>
        ) : (
          <>
            {/* ── Category filter ─────────────────────────────────────── */}
            <div className="flex gap-2 flex-wrap mb-10">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                    activeCategory === c
                      ? 'bg-forest text-white border-forest'
                      : 'bg-white text-gray-500 border-taupe hover:border-forest hover:text-forest'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-400 text-center py-20">No posts in this category yet.</p>
            ) : (
              <>
                {/* ── Featured post ──────────────────────────────────── */}
                {featured && (
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="block bg-white rounded-2xl border border-taupe overflow-hidden mb-8 grid grid-cols-1 md:grid-cols-2 hover:shadow-md transition-shadow"
                  >
                    <div className="h-64 md:h-auto overflow-hidden relative">
                      {featured.image ? (
                        <img
                          src={featured.image}
                          alt={featured.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <>
                          <video
                            src={featured.video}
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-12 h-12 rounded-full bg-black/40 text-white flex items-center justify-center text-base">▶</span>
                          </span>
                        </>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4 ${categoryColor[featured.category] ?? 'bg-taupe text-forest'}`}>
                        {featured.category}
                      </span>
                      <h2 className="text-forest font-bold text-2xl mb-3 leading-snug">{featured.title}</h2>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-300">
                          {featured.author} · {formatDate(featured.publishedAt)} · {featured.readTime}
                        </div>
                        <span className="text-forest text-sm font-semibold">Read →</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* ── Rest of posts ──────────────────────────────────── */}
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Newsletter CTA ──────────────────────────────────────────── */}
        <div className="bg-forest text-white rounded-2xl p-10 mt-14 text-center">
          <h2 className="text-xl font-bold mb-2">Get new posts in your inbox</h2>
          <p className="text-sage/80 text-sm mb-6">
            Emotion-led content, self-care ideas, and early access to new kits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-sage/60 rounded-xl px-4 py-3 text-sm outline-none focus:border-sage transition-colors"
            />
            <button className="bg-white text-forest font-semibold px-6 py-3 rounded-xl hover:bg-cream transition-colors text-sm whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-sage/50 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>

      </div>
    </div>
  )
}

function PostCard({ post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="bg-white rounded-2xl border border-taupe overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      <div className="h-48 overflow-hidden relative">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full  absolute inset-0 object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <>
            <video
              src={post.video}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center text-sm">▶</span>
            </span>
          </>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3 ${categoryColor[post.category] ?? 'bg-taupe text-forest'}`}>
          {post.category}
        </span>
        <h3 className="text-forest font-semibold text-base leading-snug mb-2">{post.title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-4">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-taupe">
          <span className="text-gray-300 text-xs">{formatDate(post.publishedAt)} · {post.readTime}</span>
          <span className="text-forest text-xs font-semibold">Read →</span>
        </div>
      </div>
    </Link>
  )
}
