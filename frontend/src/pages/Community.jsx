import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const Community = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [newPostTitle, setNewPostTitle] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/community/posts/')
      const data = response.data.results || response.data || []
      setPosts(data)
    } catch (error) {
      toast.error('Failed to load discussions')
      // Fallback to empty if fails
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!newPost.trim() || !newPostTitle.trim()) return
    
    setIsPosting(true)
    try {
      const response = await api.post('/community/posts/', {
        title: newPostTitle,
        content: newPost,
        tags: [] // Can add tag UI later
      })
      
      setPosts([response.data, ...posts])
      setNewPost('')
      setNewPostTitle('')
      toast.success('Discussion started!')
    } catch (error) {
      toast.error('Failed to post. ensure you are logged in.')
    } finally {
      setIsPosting(false)
    }
  }
  
  const handleLike = async (id) => {
    if (!user) {
        toast.error('Please login to like posts')
        return
    }

    // Optimistic Update
    const originalPosts = [...posts]
    setPosts(posts.map(post => 
        post.id === id ? { 
            ...post, 
            likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1, 
            is_liked: !post.is_liked 
        } : post
    ))

    try {
        await api.post(`/community/posts/${id}/like/`)
        // No need to update state if successful as we already did
    } catch (error) {
        // Revert on failure
        setPosts(originalPosts)
        toast.error('Could not like post')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Topics</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="font-medium text-emerald-600 cursor-pointer">🌱 All Discussions</li>
                <li className="hover:text-emerald-600 cursor-pointer">🌽 Crop Management</li>
                <li className="hover:text-emerald-600 cursor-pointer">🐛 Pest Control</li>
                <li className="hover:text-emerald-600 cursor-pointer">💰 Market Prices</li>
                <li className="hover:text-emerald-600 cursor-pointer">🌦️ Weather Chat</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-md p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Expert Corner</h3>
              <p className="text-emerald-100 text-sm mb-4">
                Weekly tips from certified agronomists.
              </p>
              <Link to="/knowledge" className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm transition-colors">
                Visit Knowledge Hub
              </Link>
            </div>
          </div>

          {/* Main Feed */}
          <div className="md:col-span-2">
            
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Ask the Community</h2>
              <form onSubmit={handlePostSubmit}>
                 <input 
                  type="text"
                  className="w-full border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors mb-2 px-3 py-2"
                  placeholder="Topic Title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <textarea
                  className="w-full border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-emerald-500 focus:border-emerald-500 transition-colors px-3 py-2"
                  placeholder="Share a tip or ask a question..."
                  rows="3"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                ></textarea>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-400">Be kind and helpful!</div>
                  <button 
                    type="submit" 
                    disabled={isPosting || !user}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-all font-medium disabled:opacity-50"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
                {!user && <p className="text-xs text-red-500 mt-2">Please login to post.</p>}
              </form>
            </div>

            {/* Posts Feed */}
            {loading ? (
                 <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                 </div>
            ) : (
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {post.author_email_prefix?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{post.author_name || post.author_email_prefix || 'Farmer'}</h4>
                            <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                          {post.tags?.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600 font-medium">#{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${post.is_liked ? 'text-red-500' : ''}`}
                          >
                            <span>{post.is_liked ? '❤️' : '🤍'}</span> <span>{post.likes_count}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-emerald-600 transition-colors">
                            <span>💬</span> <span>{post.comments_count}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {posts.length === 0 && (
                      <div className="text-center py-10 text-gray-500">
                          No discussions yet. Be the first to start one!
                      </div>
                  )}
                </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Trending Now</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-2xl">🍅</span>
                  <div>
                    <p className="font-medium text-gray-900">Tomato Blight</p>
                    <p className="text-xs text-gray-500">245 discussions</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-2xl">🌧️</span>
                  <div>
                    <p className="font-medium text-gray-900">El Niño Prep</p>
                    <p className="text-xs text-gray-500">120 discussions</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-2xl">🚜</span>
                  <div>
                    <p className="font-medium text-gray-900">Tractor Sharing</p>
                    <p className="text-xs text-gray-500">89 discussions</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Community
