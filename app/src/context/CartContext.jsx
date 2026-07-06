import { createContext, useContext, useReducer, useEffect } from 'react'

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
    default:
      return state
  }
}

const stored = JSON.parse(localStorage.getItem('snekart_cart') || '[]')

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, stored)

  useEffect(() => {
    localStorage.setItem('snekart_cart', JSON.stringify(items))
  }, [items])

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
