import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getBlogPosts } from '../services/api'
import { usePreload } from '../ssr/preload'

const BlogContext = createContext()

export function BlogProvider({ children }) {
  // Pre-rendered pages start with the build-time post list (see ProductsContext).
  const preloaded = usePreload().posts
  const [posts,   setPosts]   = useState(() => preloaded ?? [])
  const [loading, setLoading] = useState(!preloaded)

  const refetch = useCallback(() => {
    setLoading(true)
    return getBlogPosts()
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!preloaded) {
      refetch()
      return
    }
    getBlogPosts().then(fresh => { if (fresh.length > 0) setPosts(fresh) }).catch(() => {})
  }, [refetch, preloaded])

  return (
    <BlogContext.Provider value={{ posts, loading, refetch }}>
      {children}
    </BlogContext.Provider>
  )
}

export const useBlog = () => useContext(BlogContext)
