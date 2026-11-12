import { createContext, useContext, useReducer, useEffect, useState } from 'react'

const CartContext = createContext()

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.payload.id)
      if (existing) {
        return state.map(i =>
          i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...state, { ...action.payload, qty: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload)
    case 'UPDATE_QTY':
      return state.map(i =>
        i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
      )
    case 'CLEAR_CART':
      return []
    case 'LOAD_STORED':
      return action.payload
    default:
      return state
  }
}

function readStoredCart() {
  try {
    return JSON.parse(localStorage.getItem('snekart_cart') || '[]')
  } catch {
    return []
  }
}

// deferStoredCart: true for the build-time render (no localStorage there) and when the browser
// takes over a pre-rendered page — the first render must match the HTML, which shows an empty
// cart, so the saved cart is loaded right after.
export function CartProvider({ children, deferStoredCart = false }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, () => deferStoredCart ? [] : readStoredCart())
  const [storedLoaded, setStoredLoaded] = useState(!deferStoredCart)

  useEffect(() => {
    if (!deferStoredCart) return
    dispatch({ type: 'LOAD_STORED', payload: readStoredCart() })
    setStoredLoaded(true)
  }, [deferStoredCart])

  // Never save before the stored cart was read, or the empty first render would wipe it.
  useEffect(() => {
    if (storedLoaded) localStorage.setItem('snekart_cart', JSON.stringify(items))
  }, [items, storedLoaded])

  const addToCart      = (product) => dispatch({ type: 'ADD_ITEM',    payload: product })
  const removeFromCart = (id)      => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQty      = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return }
    dispatch({ type: 'UPDATE_QTY', payload: { id, qty } })
  }
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0)
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
