import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Emotions from './pages/Emotions'
import Festivals from './pages/Festivals'
import Occasions from './pages/Occasions'

// Code-split: landing pages (Home, Emotions/Festivals/Occasions) stay in the main bundle so
// search visitors see them instantly; every other page's JS downloads only when it's opened.
// RootLayout's <Suspense> shows a placeholder while a page's chunk loads.
const ProductDetail     = lazy(() => import('./pages/ProductDetail'))
const AboutUs           = lazy(() => import('./pages/AboutUs'))
const Blog              = lazy(() => import('./pages/Blog'))
const BlogPostDetail    = lazy(() => import('./pages/BlogPostDetail'))
const Cart              = lazy(() => import('./pages/Cart'))
const Checkout          = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrderDetail  = lazy(() => import('./pages/admin/AdminOrderDetail'))
const Login             = lazy(() => import('./pages/Login'))
const Register          = lazy(() => import('./pages/Register'))
const MyOrders          = lazy(() => import('./pages/MyOrders'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="shop/:slug" element={<ProductDetail />} />
          <Route path="emotions" element={<Emotions />} />
          <Route path="emotions/:slug" element={<Emotions />} />
          <Route path="festivals" element={<Festivals />} />
          <Route path="festivals/:slug" element={<Festivals />} />
          <Route path="occasions" element={<Occasions />} />
          <Route path="occasions/:slug" element={<Occasions />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPostDetail />} />
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
