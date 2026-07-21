import { Link } from 'react-router-dom'

function HeartIcon() { return <svg className="w-7 h-7 text-forest/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg> }
function GlobeIcon() { return <svg className="w-7 h-7 text-forest/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg> }
function LeafIcon()  { return <svg className="w-7 h-7 text-forest/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 3.185-9 7.115C3 14.04 7.03 17.23 12 17.23c1.903 0 3.674-.485 5.16-1.319L21 18l-1.34-3.93C20.625 12.96 21 11.81 21 10.115 21 6.185 16.97 3 12 3z"/></svg> }
function UsersIcon() { return <svg className="w-7 h-7 text-forest/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg> }

const values = [
  {
    bg: 'bg-lavender',
    Icon: HeartIcon,
    title: 'Emotion First',
    desc: 'We don\'t sell products. We sell understanding. Every kit starts with a feeling, not a SKU.',
  },
  {
    bg: 'bg-peach',
    Icon: GlobeIcon,
    title: 'Inclusive by Design',
    desc: 'Three price tiers so no one — student, professional, or parent — ever feels priced out of care.',
  },
  {
    bg: 'bg-warm',
    Icon: LeafIcon,
    title: 'Intentional Curation',
    desc: 'Nothing goes in a kit by accident. Every item earns its place by serving the emotion it\'s paired with.',
  },
  {
    bg: 'bg-sage/40',
    Icon: UsersIcon,
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
                <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center mb-4">
                  <v.Icon />
                </div>
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
