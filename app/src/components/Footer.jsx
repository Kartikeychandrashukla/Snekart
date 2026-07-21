import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const quickLinks = [
  { to: '/shop',         label: 'Shop All Kits' },
  { to: '/emotions',     label: 'Shop by Emotion' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about',        label: 'About Us' },
  { to: '/blog',         label: 'Blog' },
]

const supportLinks = [
  { to: '/cart',     label: 'My Cart' },
  { to: '/checkout', label: 'Checkout' },
]

export default function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Snekart" className="h-10 w-10 object-contain rounded-full" />
            <span className="text-xl font-semibold tracking-wide">snekart</span>
          </div>
          <p className="text-sage text-sm leading-relaxed">
            Celebrate every emotion.<br />Embrace every you.
          </p>
          <p className="text-sage text-xs mt-4">
            Emotions. Curated. Delivered.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2">
            {quickLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="text-sage text-sm hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Support</h4>
          <ul className="space-y-2">
            {supportLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="text-sage text-sm hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="mailto:hello@snekart.in" className="text-sage text-sm hover:text-white transition-colors">
                team@snekart.in
              </a>
            </li>
          </ul>
        </div>

        {/* Taglines */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Our Promise</h4>
          <ul className="space-y-2 text-sage text-sm">
            <li>Clean & Conscious</li>
            <li>Backed by Care</li>
            <li>Quality You Can Trust</li>
            <li>For Everyone</li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-sage/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-sage text-xs">© 2025 Snekart. All rights reserved.</p>
          <p className="text-sage text-xs">Made with care for every emotion.</p>
        </div>
      </div>
    </footer>
  )
}
