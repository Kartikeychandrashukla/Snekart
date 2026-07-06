import { createContext, useContext, useState, useEffect } from 'react'
import { registerCustomer, loginCustomer, logoutCustomer, getMe } from '../services/api'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [checked,  setChecked]  = useState(false)

  useEffect(() => {
    getMe()
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setChecked(true))
  }, [])

  function saveAuth(data) {
    setCustomer({ id: data.customerId, name: data.customerName, level: data.level })
  }

  function clearAuth() {
    setCustomer(null)
  }

  async function register(name, email, password) {
    const data = await registerCustomer({ name, email, password })
    saveAuth(data)
    return data
  }

  async function login(email, password) {
    const data = await loginCustomer({ email, password })
    saveAuth(data)
    return data
  }

  async function logout() {
    let message = 'Logged out successfully.'
    message = (await logoutCustomer()) ?? message
    clearAuth()
    window.dispatchEvent(new CustomEvent('snekart:logout', { detail: { message } }))
  }

  return (
    <AuthContext.Provider value={{
      customer,
      checked,
      isLoggedIn: !!customer,
      isAdmin: customer?.level === 'admin',
      register,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
