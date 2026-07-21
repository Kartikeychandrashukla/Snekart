import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { BlogProvider } from './context/BlogContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ProductsProvider>
          <BlogProvider>
            <App />
          </BlogProvider>
        </ProductsProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
