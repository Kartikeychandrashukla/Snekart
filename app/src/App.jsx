import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Emotions from './pages/Emotions'
import HowItWorks from './pages/HowItWorks'
import AboutUs from './pages/AboutUs'
import Blog from './pages/Blog'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyOrders from './pages/MyOrders'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="emotions" element={<Emotions />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="blog" element={<Blog />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="my-orders" element={<MyOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
