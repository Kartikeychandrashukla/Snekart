const steps = [
  {
    number: '01',
    title: 'Tell us how you feel',
    description: 'Pick an emotion — happy, anxious, loved, overwhelmed, or anything in between. No judgement, just you being honest with yourself.',
    bg: 'bg-lavender',
    icon: (
      <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'We match you with a kit',
    description: 'Each Snekart kit is curated specifically for that emotion — with products, scents, textures, and content that actually help you feel it, process it, or celebrate it.',
    bg: 'bg-peach',
    icon: (
      <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Your kit arrives at your door',
    description: 'Beautifully packaged, ready to open. Every kit includes a QR code linking to a curated Spotify playlist, a guided meditation, or an e-journal — made for your moment.',
    bg: 'bg-warm',
    icon: (
      <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
      </svg>
    ),
  },
]

const tiers = [
  {
    name: 'Starter Kit',
    price: '₹399–₹599',
    items: '4–5 items',
    best: 'A quick mood lift',
    bg: 'bg-warm',
    badge: 'bg-warm text-forest',
  },
  {
    name: 'Core Kit',
    price: '₹799–₹1,299',
    items: '6–8 items',
    best: 'Deep self-care sessions',
    bg: 'bg-sage/30',
    badge: 'bg-sage text-forest',
  },
  {
    name: 'Premium Kit',
    price: '₹1,999–₹5,000',
    items: '10–15 items',
    best: 'A full gifting experience',
    bg: 'bg-lavender',
    badge: 'bg-forest text-white',
  },
]

const faqs = [
  {
    q: 'Can I order a kit as a gift?',
    a: 'Absolutely. Every kit is packaged beautifully with a handwritten-style message card. Just add a note at checkout.',
  },
  {
    q: 'How do I know which kit is right for me?',
    a: 'Browse by emotion — pick how you feel right now. Every kit page tells you exactly what\'s inside and why each item is there.',
  },
  {
    q: 'Do you deliver all over India?',
    a: 'Yes. We ship Pan-India. Same-city orders in Lucknow are eligible for express delivery.',
  },
  {
    q: 'What if I don\'t like something in the kit?',
    a: 'Reach out within 7 days of delivery. We\'ll make it right — exchange or refund, no hassle.',
  },
  {
    q: 'When does the Mood Box subscription launch?',
    a: 'Month 4 (August 2025). Sign up on the home page to get early access at ₹699/month.',
  },
]

export default function HowItWorks() {
  return (
    <div className="bg-cream min-h-screen">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
          <p className="text-sage text-sm font-semibold uppercase tracking-widest mb-3">The Process</p>
          <h1 className="text-4xl font-bold text-forest mb-4 leading-tight">
            Emotions first.<br />Products second.
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            Most brands sell you products and hope they help. We start with how you feel — then build the kit around that.
          </p>
        </div>
      </div>

      {/* ── 3 Steps ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(step => (
            <div key={step.number} className={`${step.bg} rounded-2xl p-8 flex flex-col gap-5`}>
              <div className="flex items-center justify-between">
                <span className="text-forest/30 font-bold text-5xl leading-none">{step.number}</span>
                {step.icon}
              </div>
              <div>
                <h3 className="text-forest font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-forest/70 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What's Inside ──────────────────────────────────────────────── */}
      <div className="bg-forest text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
          <h2 className="text-3xl font-bold mb-2 text-center">What's inside every kit</h2>
          <p className="text-sage text-center text-sm mb-12">Beyond just products — each kit is a full experience.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌿', title: 'Curated products', desc: 'Hand-picked for the emotion — not just what looks good on a shelf.' },
              { icon: '🎵', title: 'Spotify playlist', desc: 'A QR code to a mood-matched playlist, right inside the box.' },
              { icon: '🧘', title: 'Guided meditation', desc: 'A 5–10 minute audio session to help you settle into the moment.' },
              { icon: '📓', title: 'E-journal prompts', desc: 'Questions to reflect on your emotion and what you need right now.' },
            ].map(item => (
              <div key={item.title} className="bg-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-semibold mb-1.5">{item.title}</h4>
                <p className="text-sage text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tiers ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <h2 className="text-2xl font-bold text-forest mb-2 text-center">Pick your depth</h2>
        <p className="text-gray-400 text-sm text-center mb-10">Three tiers — no customer left behind.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map(t => (
            <div key={t.name} className={`${t.bg} rounded-2xl p-6`}>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${t.badge}`}>{t.name}</span>
              <p className="text-forest font-bold text-2xl mt-4 mb-1">{t.price}</p>
              <p className="text-forest/60 text-sm mb-3">{t.items}</p>
              <p className="text-forest/80 text-sm font-medium">Best for: {t.best}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQs ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-taupe">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
          <h2 className="text-2xl font-bold text-forest mb-10 text-center">Common questions</h2>
          <div className="space-y-6">
            {faqs.map(f => (
              <div key={f.q} className="border-b border-taupe pb-6 last:border-0 last:pb-0">
                <h3 className="text-forest font-semibold mb-2">{f.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
