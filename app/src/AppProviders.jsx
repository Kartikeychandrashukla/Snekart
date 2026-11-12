import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { BlogProvider } from './context/BlogContext.jsx'
import { PreloadProvider } from './ssr/preload.js'

// The app's context tree, shared by the browser entry (main.jsx) and the build-time render
// (entry-server.jsx) so both produce identical markup.
export default function AppProviders({ preload, deferStoredCart = false, children }) {
  return (
    <PreloadProvider value={preload ?? {}}>
      <AuthProvider>
        <CartProvider deferStoredCart={deferStoredCart}>
          <ProductsProvider>
            <BlogProvider>
              {children}
            </BlogProvider>
          </ProductsProvider>
        </CartProvider>
      </AuthProvider>
    </PreloadProvider>
  )
}
