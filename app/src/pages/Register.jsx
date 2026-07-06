import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'

export default function Register() {
  const { register, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [toast,   setToast]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, navigate])

  if (isLoggedIn) return null

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('All fields are required.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      // Server-side errors (e.g. email taken) shown as toast; client errors stay inline
      setToast(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    {toast && <Toast message={toast} type="error" onClose={() => setToast(null)} />}
    <div className="bg-cream min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-taupe p-8 w-full max-w-sm shadow-sm">

        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-forest">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Join Snekart — it's free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-forest text-xs font-semibold mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Priya Sharma"
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-3 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors"
            />
          </div>

          <div>
            <label className="block text-forest text-xs font-semibold mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-3 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors"
            />
          </div>

          <div>
            <label className="block text-forest text-xs font-semibold mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-3 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors"
            />
          </div>

          <div>
            <label className="block text-forest text-xs font-semibold mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-cream border border-taupe rounded-xl px-4 py-3 text-sm text-forest placeholder-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-white font-semibold py-3 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
    </>
  )
}
