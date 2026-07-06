import { Link } from 'react-router-dom'

const values = [
  {
    bg: 'bg-lavender',
    icon: '💜',
    title: 'Emotion First',
    desc: 'We don\'t sell products. We sell understanding. Every kit starts with a feeling, not a SKU.',
  },
  {
    bg: 'bg-peach',
    icon: '🌍',
    title: 'Inclusive by Design',
    desc: 'Three price tiers so no one — student, professional, or parent — ever feels priced out of care.',
  },
  {
    bg: 'bg-warm',
    icon: '🌱',
    title: 'Intentional Curation',
    desc: 'Nothing goes in a kit by accident. Every item earns its place by serving the emotion it\'s paired with.',
  },
  {
    bg: 'bg-sage/40',
    icon: '🤝',
    title: 'Community Over Campaign',
    desc: 'We\'re building India\'s first Emotion Community — not a brand following, a genuine support circle.',
  },
]

const milestones = [
  { year: 'Apr 2025', label: 'Snekart founded in Lucknow' },
  { year: 'Jun 2025', label: 'Soft launch — first 100 customers' },
  { year: 'Jul 2025', label: 'Official launch + marketplace go-live' },
  { year: 'Aug 2025', label: 'Mood Box subscription launches' },
  { year: 'Sep 2025', label: 'Festival season — influencer scale' },
  { year: '2027',     label: 'Goal: India\'s most loved emotion brand' },
]

export default function AboutUs() {
  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="bg-forest text-white">
        <div className="max-w-4xl mx-auto px-8 py-20 text-center">
          <p className="text-sage text-sm font-semibold uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-4xl font-bold mb-5 leading-tight">
            India's first emotion-targeted<br />wellness kit brand
          </h1>
          <p className="text-sage/80 text-base max-w-2xl mx-auto leading-relaxed">
            We started Snekart because we noticed something missing — no brand was asking
            <em> how you feel</em> before selling you something. Everyone sold products.
            Nobody sold understanding. We decided to change that.
          </p>
        </div>
      </div>

      {/* ── Mission ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sage text-sm font-semibold uppercase tracking-widest mb-3">Mission</p>
          <h2 className="text-3xl font-bold text-forest mb-5 leading-snug">
            Celebrate every emotion.<br />Embrace every you.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Emotions aren't problems to fix. They're experiences to honour. Whether you're
            riding a high, sitting in sadness, or somewhere in the complicated middle —
            there's a Snekart kit for exactly where you are.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            We map products to feelings so you never have to guess what you need. Just tell
            us how you feel. We'll do the rest.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-taupe p-8">
          <p className="text-forest font-bold text-lg mb-6">By 2027, we want to be</p>
          <div className="space-y-4">
            {[
              'India\'s most loved emotion-driven lifestyle brand',
              'Serving 50,000+ customers across every state',
              'Expanding into Southeast Asia by 2029',
              'Running the largest Emotion Community in South Asia',
            ].map(item => (
              <div key={item} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-sage/30 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-forest" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                </div>
                <p className="text-forest/80 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Values ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-taupe">
        <div className="max-w-5xl mx-auto px-8 py-16">
          <p className="text-sage text-sm font-semibold uppercase tracking-widest mb-2 text-center">What we stand for</p>
          <h2 className="text-2xl font-bold text-forest mb-10 text-center">Our values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className={`${v.bg} rounded-2xl p-6`}>
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="text-forest font-bold mb-2">{v.title}</h3>
                <p className="text-forest/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline ───────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-8 py-16">
        <p className="text-sage text-sm font-semibold uppercase tracking-widest mb-2 text-center">Where we've been</p>
        <h2 className="text-2xl font-bold text-forest mb-12 text-center">The Snekart journey</h2>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-taupe"/>
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6 items-start pl-12 relative">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-forest flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-sage"/>
                </div>
                <div>
                  <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-1">{m.year}</p>
                  <p className="text-forest font-semibold text-sm">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <div className="bg-forest text-white">
        <div className="max-w-2xl mx-auto px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to find your kit?</h2>
          <p className="text-sage/80 text-sm mb-8 leading-relaxed">
            Tell us how you feel. We'll find the right kit for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/emotions"
              className="bg-white text-forest font-semibold px-8 py-3.5 rounded-xl hover:bg-cream transition-colors"
            >
              Shop by Emotion
            </Link>
            <Link
              to="/how-it-works"
              className="border border-sage text-sage font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
