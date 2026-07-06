import { useState } from 'react'

const posts = [
  {
    id: 1,
    category: 'Self-Care',
    categoryBg: 'bg-lavender text-forest',
    title: 'Why your emotions deserve a ritual, not just a reaction',
    excerpt: "We're taught to manage emotions — suppress, redirect, move on. But what if honouring them was the healthier choice? Here's what the research says.",
    author: 'Snekart Team',
    date: 'Jun 15, 2025',
    readTime: '4 min read',
    image: 'https://picsum.photos/seed/blog1/600/400',
  },
  {
    id: 2,
    category: 'Gifting',
    categoryBg: 'bg-peach text-forest',
    title: "The problem with gifting in India — and how we're fixing it",
    excerpt: "Chocolates and dry fruits. Every time. There's a better way to show someone you actually understand what they're going through.",
    author: 'Snekart Team',
    date: 'Jun 22, 2025',
    readTime: '5 min read',
    image: 'https://picsum.photos/seed/blog2/600/400',
  },
  {
    id: 3,
    category: 'Anxiety',
    categoryBg: 'bg-dusty text-forest',
    title: '5 things to do when anxiety hits at 2am',
    excerpt: "No phone. No doomscrolling. Just five things that genuinely help when your mind won't stop — from scent to breath to the right kind of distraction.",
    author: 'Snekart Team',
    date: 'Jul 1, 2025',
    readTime: '3 min read',
    image: 'https://picsum.photos/seed/blog3/600/400',
  },
  {
    id: 4,
    category: 'Community',
    categoryBg: 'bg-sage/60 text-forest',
    title: "Building India's first Emotion Community — why and how",
    excerpt: "Most brands build followings. We want to build something rarer — a space where people feel genuinely seen, regardless of what they're going through.",
    author: 'Snekart Team',
    date: 'Jul 5, 2025',
    readTime: '6 min read',
    image: 'https://picsum.photos/seed/blog4/600/400',
  },
  {
    id: 5,
    category: 'Self-Care',
    categoryBg: 'bg-lavender text-forest',
    title: "The science behind scent and mood — what's actually happening",
    excerpt: "Why does a certain candle make you feel calm instantly? Why does lavender work? We break down the neuroscience without the jargon.",
    author: 'Snekart Team',
    date: 'Jul 10, 2025',
    readTime: '5 min read',
    image: 'https://picsum.photos/seed/blog5/600/400',
  },
  {
    id: 6,
    category: 'Gifting',
    categoryBg: 'bg-peach text-forest',
    title: 'How to gift someone going through a hard time',
    excerpt: "It's not about the price tag. It's about showing up correctly. A guide to thoughtful gifting for loss, heartbreak, burnout, and everything in between.",
    author: 'Snekart Team',
    date: 'Jul 15, 2025',
    readTime: '4 min read',
    image: 'https://picsum.photos/seed/blog6/600/400',
  },
]

const categories = ['All', 'Self-Care', 'Gifting', 'Anxiety', 'Community']

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')

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

        {/* ── Category filter ─────────────────────────────────────────── */}
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
            {/* ── Featured post ──────────────────────────────────────── */}
            {featured && (
              <div className="bg-white rounded-2xl border border-taupe overflow-hidden mb-8 grid grid-cols-1 md:grid-cols-2">
                <div className="h-64 md:h-auto overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4 ${featured.categoryBg}`}>
                    {featured.category}
                  </span>
                  <h2 className="text-forest font-bold text-2xl mb-3 leading-snug">{featured.title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-300">
                      {featured.author} · {featured.date} · {featured.readTime}
                    </div>
                    <button className="text-forest text-sm font-semibold hover:underline">
                      Read →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Rest of posts ──────────────────────────────────────── */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
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
    <div className="bg-white rounded-2xl border border-taupe overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-48 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3 ${post.categoryBg}`}>
          {post.category}
        </span>
        <h3 className="text-forest font-semibold text-base leading-snug mb-2">{post.title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed flex-1 mb-4">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-taupe">
          <span className="text-gray-300 text-xs">{post.date} · {post.readTime}</span>
          <button className="text-forest text-xs font-semibold hover:underline">Read →</button>
        </div>
      </div>
    </div>
  )
}
