import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProducts } from '../services/api'

const ProductsContext = createContext()

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  const refetch = useCallback(() => {
    setLoading(true)
    return getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <ProductsContext.Provider value={{ products, loading, refetch }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => useContext(ProductsContext)
