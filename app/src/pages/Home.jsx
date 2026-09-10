import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import heroImage from '../assets/hero.png'

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
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/85 to-cream/25 sm:hidden" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-forest leading-tight mb-5">
              Every Emotion.<br />The Right Care.
            </h1>
            <p className="text-black text-lg leading-relaxed mb-8 max-w-md">
              Personalized wellness kits crafted for every emotion and every you.
            </p>
            <Link
              to="/emotions"
              className="inline-block bg-forest text-white text-sm font-medium px-7 py-3 rounded-lg hover:bg-forest/90 transition-colors"
            >
              Explore Kits
            </Link>
          </div>
        </div>
      </section>

      {/* ── SHOP BY — three ways in ──────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-forest text-center mb-2">
            Three Ways to Find Your Kit
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10">
            Shop by how you feel, what you're celebrating, or what the moment calls for.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { to: '/emotions',  title: 'Shop by Emotion',  desc: 'Kits matched to how you feel right now.' },
              { to: '/festivals', title: 'Shop by Festival', desc: 'Kits made for the festivities.' },
              { to: '/occasions', title: 'Shop by Occasion', desc: 'The right gift for the moment.' },
            ].map(card => (
              <Link
                key={card.to}
                to={card.to}
                className="bg-cream border border-taupe rounded-2xl p-8 text-center hover:border-forest hover:shadow-sm transition-all duration-200"
              >
                <h3 className="text-forest font-bold text-lg mb-1.5">{card.title}</h3>
                <p className="text-gray-400 text-sm">{card.desc}</p>
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
              to="/emotions"
              className="inline-block bg-forest text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-forest/90 transition-colors"
            >
              Shop All Kits
            </Link>
          </div>

          {/* Right kit images */}
          <div className="w-full lg:flex-1 min-w-0 flex gap-4 overflow-x-auto pb-1">
            {featuredKits.map(kit => (
              <Link key={kit.id} to={`/shop/${kit.slug}`} className="shrink-0 group">
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
