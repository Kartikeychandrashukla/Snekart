import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getBlogPosts } from '../services/api'

const BlogContext = createContext()

export function BlogProvider({ children }) {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    setLoading(true)
    return getBlogPosts()
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <BlogContext.Provider value={{ posts, loading, refetch }}>
      {children}
    </BlogContext.Provider>
  )
}

export const useBlog = () => useContext(BlogContext)
