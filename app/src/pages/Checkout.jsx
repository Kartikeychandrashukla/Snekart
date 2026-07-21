import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { placeOrder, verifyPayment } from '../services/api'
import Toast from '../components/Toast'

const DELIVERY_CHARGE  = 80
const FREE_ABOVE       = 2000

const initialForm = {
  name: '', phone: '', email: '',
  address: '', city: '', state: '', pincode: '',
}

// Loads the Razorpay checkout widget once, on demand — no need to pull it in
// for customers who only ever pay COD.
let razorpayScriptPromise = null
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise(resolve => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload  = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }
  return razorpayScriptPromise
}

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form,          setForm]          = useState(initialForm)
  const [errors,        setErrors]        = useState({})
  const [loading,       setLoading]       = useState(false)
  const [toast,         setToast]         = useState(null)
  const [paymentMethod] = useState('COD')

  const delivery   = cartTotal >= FREE_ABOVE ? 0 : DELIVERY_CHARGE
  const grandTotal = cartTotal + delivery

  // ── Redirect if cart is empty ──────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
        <p className="text-forest font-semibold text-xl">Your cart is empty</p>
        <Link to="/shop" className="bg-forest text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-forest/90 transition-colors">
          Go to Shop
        </Link>
      </div>
    )
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!form.name.trim())                         e.name    = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone))          e.phone   = 'Enter a valid 10-digit phone number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.address.trim())                      e.address = 'Address is required'
    if (!form.city.trim())                         e.city    = 'City is required'
    if (!form.state.trim())                        e.state   = 'State is required'
    if (!/^\d{6}$/.test(form.pincode))             e.pincode = 'Enter a valid 6-digit pincode'
    return e
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const order = await placeOrder({
        items,
        address: form,
        paymentMethod,
      })

      if (paymentMethod === 'COD') {
        clearCart()
        navigate(`/order-confirmation/${order.orderId}`)
        return
      }

      await payWithRazorpay(order)
    } catch (err) {
      setLoading(false)
      setToast(err.message)
    }
  }

  async function payWithRazorpay(order) {
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setLoading(false)
      setToast('Could not load payment gateway. Please try again.')
      return
    }

    const razorpay = new window.Razorpay({
      key:      order.razorpayKeyId,
      order_id: order.razorpayOrderId,
      amount:   Math.round(order.total * 100),
      currency: 'INR',
      name:     'Snekart',
      prefill:  { name: form.name, contact: form.phone, email: form.email },
      handler: async (response) => {
        try {
          await verifyPayment(order.orderId, {
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          clearCart()
          navigate(`/order-confirmation/${order.orderId}`)
        } catch (err) {
          setLoading(false)
          setToast(err.message)
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false)
          setToast('Payment was not completed. You can try again.')
        },
      },
    })
    razorpay.open()
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  return (
    <>
    {toast && <Toast message={toast} type="error" onClose={() => setToast(null)} />}
    <div className="bg-cream min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-taupe">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold text-forest">Checkout</h1>
          <p className="text-gray-400 text-sm mt-1">Almost there — just your delivery details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Address Form ──────────────────────────────────────────────── */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-taupe p-6">
              <h2 className="text-forest font-bold text-lg mb-5">Delivery Address</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name"     name="name"    value={form.name}    onChange={handleChange} error={errors.name}    placeholder="Priya Sharma" span />
                <Field label="Phone Number"  name="phone"   value={form.phone}   onChange={handleChange} error={errors.phone}   placeholder="9876543210" type="tel" />
                <Field label="Email Address" name="email"   value={form.email}   onChange={handleChange} error={errors.email}   placeholder="priya@email.com" type="email" />
                <Field label="Address"       name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="House / Flat / Street" span />
                <Field label="City"          name="city"    value={form.city}    onChange={handleChange} error={errors.city}    placeholder="Lucknow" />
                <Field label="State"         name="state"   value={form.state}   onChange={handleChange} error={errors.state}   placeholder="Uttar Pradesh" />
                <Field label="Pincode"       name="pincode" value={form.pincode} onChange={handleChange} error={errors.pincode} placeholder="226001" />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-taupe p-6 mt-4">
              <h2 className="text-forest font-bold text-lg mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-forest bg-cream">
                <div className="w-4 h-4 rounded-full border-2 border-forest flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-forest"/>
                </div>
                <div>
                  <p className="text-forest font-semibold text-sm">Cash on Delivery (COD)</p>
                  <p className="text-gray-400 text-xs">Pay when your kit arrives at your door</p>
                </div>
              </div>
              <p className="text-gray-300 text-xs mt-3">Online payment is coming soon.</p>
            </div>
          </div>

          {/* ── Order Summary ──────────────────────────────────────────────── */}
          <div className="lg:w-80 w-full shrink-0 sticky top-20">
            <div className="bg-white rounded-2xl border border-taupe p-6">
              <h2 className="text-forest font-bold text-lg mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-forest text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.qty}</p>
                    </div>
                    <p className="text-forest text-xs font-bold shrink-0">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-taupe pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  {delivery === 0
                    ? <span className="text-sage font-semibold">FREE</span>
                    : <span>₹{delivery}</span>}
                </div>
              </div>

              <div className="border-t border-taupe mt-4 pt-4 flex justify-between">
                <span className="text-forest font-bold">Grand Total</span>
                <span className="text-forest font-bold text-xl">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 bg-forest text-white font-semibold py-3.5 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Placing Order...
                  </>
                ) : 'Place Order'}
              </button>

              <p className="text-center text-gray-300 text-xs mt-3">
                By placing this order you agree to our terms.
              </p>
            </div>
          </div>

        </div>
      </form>
    </div>
    </>
  )
}

// ── Reusable Field ─────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, error, placeholder, type = 'text', span }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="block text-forest text-xs font-semibold mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-cream border rounded-xl px-4 py-2.5 text-sm text-forest placeholder-gray-300 outline-none transition-colors
          focus:border-forest focus:ring-1 focus:ring-forest
          ${error ? 'border-red-300' : 'border-taupe'}`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
