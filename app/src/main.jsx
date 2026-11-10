import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted Inter (one variable-weight file) — bundled with our CSS instead of a
// render-blocking @import to Google Fonts.
import '@fontsource-variable/inter'
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
