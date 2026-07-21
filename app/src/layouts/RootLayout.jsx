import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import ScrollToTop from '../components/ScrollToTop'
import { useAuth } from '../context/AuthContext'

export default function RootLayout() {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const [toast, setToast] = useState(null) // { message, type }

  useEffect(() => {
    function onUnauthorized() {
      logout()
      setToast({ message: 'Session expired. Please log in again.', type: 'warning' })
      navigate('/login')
    }
    function onLogout(e) {
      setToast({ message: e.detail?.message ?? 'Logged out successfully.', type: 'success' })
      navigate('/')
    }
    window.addEventListener('snekart:unauthorized', onUnauthorized)
    window.addEventListener('snekart:logout', onLogout)
    return () => {
      window.removeEventListener('snekart:unauthorized', onUnauthorized)
      window.removeEventListener('snekart:logout', onLogout)
    }
  }, [logout, navigate])

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
