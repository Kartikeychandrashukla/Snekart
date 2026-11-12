import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Emotions from './pages/Emotions'
import Festivals from './pages/Festivals'
import Occasions from './pages/Occasions'
import NotFound from './pages/NotFound'
import Seo from './components/Seo'

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

// Account/checkout pages: never indexed (also disallowed in robots.txt). The host serves them
// app-shell.html, which carries the same noindex before any JavaScript runs.
function Private({ title, children }) {
  return (
    <>
      <Seo title={title} description="Snekart – gift hampers delivered across Lucknow." noindex />
      {children}
    </>
  )
}

// The route table, shared by the browser (BrowserRouter, below) and the build-time render
// (StaticRouter in entry-server.jsx).
export function AppRoutes() {
  return (
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
        <Route path="cart" element={<Private title="Your Cart – Snekart"><Cart /></Private>} />
        <Route path="checkout" element={<Private title="Checkout – Snekart"><Checkout /></Private>} />
        <Route path="order-confirmation/:orderId" element={<Private title="Order Confirmed – Snekart"><OrderConfirmation /></Private>} />
        <Route path="admin" element={<Private title="Admin – Snekart"><AdminDashboard /></Private>} />
        <Route path="admin/orders/:id" element={<Private title="Order – Snekart Admin"><AdminOrderDetail /></Private>} />
        <Route path="login" element={<Private title="Log In – Snekart"><Login /></Private>} />
        <Route path="register" element={<Private title="Create Account – Snekart"><Register /></Private>} />
        <Route path="my-orders" element={<Private title="My Orders – Snekart"><MyOrders /></Private>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
