import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const Marketplace = () => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const demoProducts = [
    {
      id: 'demo-1',
      title: 'Tomato Seeds - Hybrid F1',
      category: 'seeds',
      description: 'High-germination hybrid tomato seeds; disease tolerant and early maturing.',
      price: 520,
      stock: 120,
      vendor_name: 'Kenya Seed Co',
      images: [{ image: 'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=800&q=80' }]
    },
    {
      id: 'demo-2',
      title: 'NPK 20-10-10 Fertilizer',
      category: 'fertilizers',
      description: 'Balanced NPK fertilizer for leafy greens and cereals; improves vigor and yield.',
      price: 2450,
      stock: 80,
      vendor_name: 'Yara East Africa',
      images: [{ image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80' }]
    },
    {
      id: 'demo-3',
      title: 'Neem Oil Insecticide',
      category: 'pest-control',
      description: 'Organic pest control for aphids and whiteflies; safe pre-harvest interval.',
      price: 1150,
      stock: 65,
      vendor_name: 'BioFix',
      images: [{ image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80' }]
    },
    {
      id: 'demo-4',
      title: 'Drip Irrigation Starter Kit',
      category: 'tools',
      description: 'Complete 100m drip kit with emitters; water-efficient irrigation for smallholders.',
      price: 14990,
      stock: 15,
      vendor_name: 'AgriTech Solutions',
      images: [{ image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80' }]
    }
  ]

  useEffect(() => {
    fetchProducts()
    // Refetch every 5 seconds to catch newly added products
    const interval = setInterval(fetchProducts, 5000)
    return () => clearInterval(interval)
  }, [filters])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.min_price) params.append('min_price', filters.min_price)
      if (filters.max_price) params.append('max_price', filters.max_price)

      const response = await api.get(`/marketplace/products/?${params}`)
      // Handle both paginated and direct list responses
      let data = response.data
      if (data.results) {
        data = data.results
      } else if (Array.isArray(data)) {
        data = data
      } else {
        data = []
      }
      setProducts(data.length > 0 ? data : demoProducts)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Fallback to demo data if backend offline/empty
      setProducts(demoProducts)
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-emerald-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Marketplace</h1>
          <p className="text-emerald-100 text-lg max-w-2xl">
            Source high-quality inputs from verified vendors. Protected payments via M-Pesa.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 bg-white rounded-xl shadow-lg p-6 h-fit ${showFilters ? 'block' : 'hidden lg:block'}`}>
            
             {/* Vendor Action */}
             <div className="mb-6 pb-6 border-b border-gray-100">
               <Link to="/marketplace/add" className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                 + Sell Item
               </Link>
             </div>

            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛒</span> Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
                <input
                  type="text"
                  placeholder="Seeds, tools..."
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Price Range (KES)</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={filters.min_price}
                    onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    value={filters.max_price}
                    onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  <option value="seeds">Seeds & Seedlings</option>
                  <option value="fertilizers">Fertilizers</option>
                  <option value="protection">Crop Protection</option>
                  <option value="tools">Farm Tools</option>
                </select>
              </div>

              <button 
                onClick={() => setFilters({ search: '', category: '', min_price: '', max_price: '' })}
                className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <button 
              className="lg:hidden w-full bg-white mb-4 p-3 rounded-lg shadow-sm font-semibold text-gray-700 flex justify-between items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              <span>⚙️</span>
            </button>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={item}
                      whileHover={{ y: -5 }}
                      layout
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                    >
                      <Link to={`/marketplace/product/${product.id}`} className="block relative">
                        {product.images?.[0] ? (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={product.images[0].image}
                              alt={product.title}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Overlay Badge */}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm">
                              Stock: {product.stock}
                            </div>
                          </div>
                        ) : (
                          <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wide">
                              {product.category?.name || product.category || 'Inputs'}
                            </p>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              🏪 {product.vendor_name || 'Verified'}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                            {product.description}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-50 gap-2">
                            <div>
                              <p className="text-xs text-gray-400">Price</p>
                              <p className="text-xl font-bold text-gray-900">KES {product.price.toLocaleString()}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                addToCart(product)
                              }}
                              className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors shadow-sm"
                              title="Add to Cart"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marketplace
