import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProducts } from '../services/api'
import { usePreload } from '../ssr/preload'

const ProductsContext = createContext()

export function ProductsProvider({ children }) {
  // Pre-rendered pages start with the build-time product list, so there's no "loading" state.
  const preloaded = usePreload().products
  const [products, setProducts] = useState(() => preloaded ?? [])
  const [loading,  setLoading]  = useState(!preloaded)

  const refetch = useCallback(() => {
    setLoading(true)
    return getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!preloaded) {
      refetch()
      return
    }
    // Quietly refresh the build-time list (prices, stock) without flipping back to "loading",
    // which would hide and re-show the grid. An outage returns [] — keep the preloaded list then.
    getProducts().then(fresh => { if (fresh.length > 0) setProducts(fresh) }).catch(() => {})
  }, [refetch, preloaded])

  return (
    <ProductsContext.Provider value={{ products, loading, refetch }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => useContext(ProductsContext)
