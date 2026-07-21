import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import heroImage from '../assets/hero.png'
// ── Emotion data ──────────────────────────────────────────────────────────────
const emotions = [
  { id: 'happy',       label: 'Happy' },
  { id: 'loved',       label: 'Loved' },
  { id: 'anxious',     label: 'Anxious' },
  { id: 'sad',         label: 'Sad' },
  { id: 'calm',        label: 'Calm' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
  { id: 'festive', label: 'Festive' },

]

// ── Face SVGs (matching the mockup line-drawn circles) ────────────────────────
function FaceSVG({ type }) {
  const base = "w-12 h-12 text-forest/70"
  const faces = {
    happy: (
      <svg className={base} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="22" cy="22" r="20"/>
        <path d="M14 26 Q22 33 30 26" strokeLinecap="round"/>
        <circle cx="16" cy="18" r="2" fill="currentColor" stroke="none"/>
        <circle cx="28" cy="18" r="2" fill="currentColor" stroke="none"/>
      </svg>
    ),
    loved: (
      <svg className={base} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="22" cy="22" r="20"/>
        <path d="M14 25 Q22 32 30 25" strokeLinecap="round"/>
        <path d="M15 16 Q16 13 18 15 Q19 13 21 16 Q18 19 15 16Z" fill="currentColor" stroke="none"/>
        <path d="M23 16 Q24 13 26 15 Q27 13 29 16 Q26 19 23 16Z" fill="currentColor" stroke="none"/>
      </svg>
    ),
    anxious: (
      <svg className={base} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="22" cy="22" r="20"/>
        <path d="M14 29 Q22 23 30 29" strokeLinecap="round"/>
        <path d="M14 17 L18 19" strokeLinecap="round"/>
        <path d="M30 17 L26 19" strokeLinecap="round"/>
        <circle cx="17" cy="21" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="27" cy="21" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    sad: (
      <svg className={base} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="22" cy="22" r="20"/>
        <path d="M14 30 Q22 23 30 30" strokeLinecap="round"/>
        <circle cx="16" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="28" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="29" cy="24" r="1.5" fill="currentColor" stroke="none" opacity="0.4"/>
      </svg>
    ),
    calm: (
      <svg className={base} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="22" cy="22" r="20"/>
        <path d="M15 26 Q22 30 29 26" strokeLinecap="round"/>
        <path d="M14 18 Q17 16 20 18" strokeLinecap="round"/>
        <path d="M24 18 Q27 16 30 18" strokeLinecap="round"/>
      </svg>
    ),
    overwhelmed: (
      <svg className={base} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="22" cy="22" r="20"/>
        <line x1="15" y1="27" x2="29" y2="27" strokeLinecap="round"/>
        <circle cx="16" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="28" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        <path d="M18 13 Q22 10 26 13" strokeLinecap="round"/>
      </svg>
    ),
    festive: (
  <svg className={base} viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="22" cy="22" r="20"/>
    <path d="M13 26 Q22 34 31 26" strokeLinecap="round"/>
    <path d="M15 16 L17.5 19 M15 19 L17.5 16" strokeLinecap="round"/>
    <path d="M29 16 L26.5 19 M29 19 L26.5 16" strokeLinecap="round"/>
    <path d="M22 6 L22 10 M18.5 7 L19.5 10.5 M25.5 7 L24.5 10.5" strokeLinecap="round"/>
  </svg>
),

  }
  return faces[type] || null
}

// ── Value prop icons ───────────────────────────────────────────────────────────
function LeafIcon()  { return <svg className="w-6 h-6 text-forest/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 3.185-9 7.115C3 14.04 7.03 17.23 12 17.23c1.903 0 3.674-.485 5.16-1.319L21 18l-1.34-3.93C20.625 12.96 21 11.81 21 10.115 21 6.185 16.97 3 12 3z"/></svg> }
function HeartIcon() { return <svg className="w-6 h-6 text-forest/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg> }
function BadgeIcon() { return <svg className="w-6 h-6 text-forest/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg> }
function GlobeIcon() { return <svg className="w-6 h-6 text-forest/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg> }

const valueProps = [
  { Icon: LeafIcon,  title: 'Clean & Conscious',      desc: 'We choose only what\'s good for you.' },
  { Icon: HeartIcon, title: 'Backed by Care',          desc: 'Mindful products for emotional wellbeing.' },
  { Icon: BadgeIcon, title: 'Quality You Can Trust',   desc: 'Handpicked, tested and made with intention.' },
  { Icon: GlobeIcon, title: 'For Everyone',            desc: 'Designed for all emotions, ages and walks of life.' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { products } = useProducts()
  const featuredKits = products.filter(p => p.badge).slice(0, 4)

  return (
    <div className="bg-cream">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-cover bg-center sm:aspect-[3/2]"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-cream/70 sm:hidden" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-forest leading-tight mb-5">
              Every Emotion.<br />The Right Care.
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Personalized wellness kits crafted for every emotion and every you.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-forest text-white text-sm font-medium px-7 py-3 rounded-lg hover:bg-forest/90 transition-colors"
            >
              Explore Kits
            </Link>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 sm:gap-10 mt-10">
              {[
                { icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                    </svg>
                  ), label: 'Thoughtfully\nCurated' },
                { icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                    </svg>
                  ), label: 'Emotional\nWellness Focused' },
                { icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                    </svg>
                  ), label: 'For Every\nYou' },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-forest">{b.icon}</span>
                  <span className="text-xs text-gray-500 font-medium whitespace-pre-line leading-snug">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EMOTION GRID ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-forest text-center mb-2">
            Wellness for Every Emotion
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10">
            Because every feeling deserves the right support.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {emotions.map(e => (
              <Link
                key={e.id}
                to={`/emotions?e=${e.id}`}
                className="flex flex-col items-center gap-3 py-7 hover:scale-[1.03] transition-transform duration-200"
              >
                <FaceSVG type={e.id} />
                <span className="text-forest font-semibold text-sm">{e.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED KITS ────────────────────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: '#EDE8E1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center gap-12">

          {/* Left text */}
          <div className="lg:w-80 shrink-0">
            <h2 className="text-4xl font-bold text-forest leading-tight mb-4">
              Curated Kits.<br />Real Impact.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-7">
              Each kit is mindfully designed with products that support, uplift and bring balance to your emotional wellbeing.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-forest text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-forest/90 transition-colors"
            >
              Shop All Kits
            </Link>
          </div>

          {/* Right kit images */}
          <div className="w-full lg:flex-1 min-w-0 flex gap-4 overflow-x-auto pb-1">
            {featuredKits.map(kit => (
              <Link key={kit.id} to={`/shop?kit=${kit.slug}`} className="shrink-0 group">
                <div className="relative w-44 h-52 rounded-xl overflow-hidden shadow-sm">
                  <img
                    src={kit.image}
                    alt={kit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent"/>
                  <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium leading-snug">
                    {kit.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ──────────────────────────────────────────────────── */}
      <section className="bg-cream border-y border-taupe py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-taupe">
          {valueProps.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 px-6 py-4 lg:py-0 first:pl-0 last:pr-0">
              <Icon />
              <div>
                <p className="text-forest font-semibold text-sm mb-1">{title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ──────────────────────────────────────────────────── */}
      <section className="bg-forest py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center gap-10">

          {/* Illustration placeholder */}
          <div className="shrink-0 w-32 h-32 rounded-full bg-sage/20 flex items-center justify-center">
            <svg className="w-16 h-16 text-sage" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 64 64">
              <circle cx="32" cy="20" r="12"/>
              <path d="M10 54c0-12.15 9.85-22 22-22s22 9.85 22 22"/>
              <path d="M24 38 Q32 46 40 38" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Quote */}
          <div className="flex-1 text-center md:text-left">
            <span className="text-sage text-7xl font-serif leading-none block mb-2">"</span>
            <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-4">
              Snekart helped me feel seen, supported and so much more in control.
            </p>
            <p className="text-sage text-sm">– A Snekart Customer</p>
          </div>

          {/* Nav arrows */}
          <div className="flex gap-3 shrink-0">
            <button className="w-9 h-9 rounded-full border border-sage/40 text-sage flex items-center justify-center hover:bg-sage/10 transition-colors">
              ‹
            </button>
            <button className="w-9 h-9 rounded-full border border-sage/40 text-sage flex items-center justify-center hover:bg-sage/10 transition-colors">
              ›
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
