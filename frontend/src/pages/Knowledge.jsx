import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

const Knowledge = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Disease Control', 'Soil Management', 'Pest Control', 'Market Tips', 'Crop Guides']

  const demoArticles = [
    {
      id: 'demo-1',
      slug: 'managing-early-blight',
      title: 'Managing Early Blight in Tomatoes',
      category: 'Disease Control',
      body: 'Identify brown concentric rings, remove infected leaves, apply copper fungicide, and improve spacing to reduce humidity. Early blight is a common disease...',
      author_name: 'Agro Team',
      publish_date: new Date().toISOString(),
      featured_image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d9?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'demo-2',
      slug: 'soil-health-biomass',
      title: 'Building Soil Health with Biomass',
      category: 'Soil Management',
      body: 'Incorporate compost, keep soil covered, and rotate with legumes to boost nitrogen and microbial life. Healthy soil is the foundation...',
      author_name: 'Soil Lab',
      publish_date: new Date().toISOString(),
      featured_image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'demo-3',
      slug: 'ipm-aphids',
      title: 'Integrated Pest Management for Aphids',
      category: 'Pest Control',
      body: 'Scout weekly, introduce beneficial insects, use neem oil at dusk, and avoid over-fertilizing with nitrogen. Aphids can transmit viruses...',
      author_name: 'Field Notes',
      publish_date: new Date().toISOString(),
      featured_image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'demo-4',
      slug: 'market-prices-2024',
      title: 'Maximizing Profits: Market Trends 2024',
      category: 'Market Tips',
      body: 'Understand seasonal price fluctuations. Timing your harvest can result in 30% higher returns. Focus on off-season production...',
      author_name: 'Market Watch',
      publish_date: new Date(Date.now() - 86400000).toISOString(),
      featured_image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80'
    }
  ]

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await api.get('/knowledge/articles/')
      const data = response.data.results || response.data || []
      setArticles(data.length ? data : demoArticles)
    } catch (error) {
      setArticles(demoArticles)
    } finally {
      setLoading(false)
    }
  }

  const calculateReadTime = (text) => {
    const wordsPerMinute = 200
    const words = text?.trim().split(/\s+/).length || 0
    return Math.ceil(words / wordsPerMinute)
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.body?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Featured Article (First one or specific logic)
  const featuredArticle = filteredArticles[0]
  const listArticles = filteredArticles.slice(1)

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Header */}
      <div className="bg-teal-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6"
          >
            The Knowledge Hub
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-teal-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Cultivating wisdom for modern farming. Expert guides, localized tips, and market insights.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto relative"
          >
            <input
              type="text"
              placeholder="Search for 'pest control', 'maize', 'pricing'..."
              className="w-full px-8 py-5 rounded-full text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-teal-500/30 shadow-2xl text-lg placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-6 top-5 text-2xl text-teal-800">🔍</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-md
                        ${selectedCategory === cat 
                            ? 'bg-emerald-500 text-white scale-105 ring-4 ring-emerald-500/20' 
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
            <>
                {/* Featured Article */}
                {featuredArticle && !searchTerm && selectedCategory === 'All' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 group cursor-pointer"
                    >
                        <div className="h-64 md:h-auto relative overflow-hidden">
                             <img 
                                src={featuredArticle.featured_image} 
                                alt={featuredArticle.title} 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                             />
                             <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                Featured
                             </div>
                        </div>
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-sm text-teal-600 font-bold mb-4">
                                <span className=" uppercase tracking-wide">{featuredArticle.category}</span>
                                <span>•</span>
                                <span>{calculateReadTime(featuredArticle.body)} min read</span>
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 group-hover:text-teal-700 transition-colors">
                                <Link to={`/knowledge/article/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
                            </h2>
                            <p className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                                {featuredArticle.body}
                            </p>
                            <Link to={`/knowledge/article/${featuredArticle.slug}`} className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
                                Read Full Article <span>→</span>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Article Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(searchTerm || selectedCategory !== 'All' ? filteredArticles : listArticles).map((article, index) => (
                    <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-100"
                    >
                        <Link to={`/knowledge/article/${article.slug}`} className="flex-1 flex flex-col">
                        <div className="h-56 overflow-hidden relative">
                            <img
                                src={article.featured_image}
                                alt={article.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-teal-800 uppercase tracking-wide">
                                {article.category || 'Guide'}
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-3 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1">
                                    🕒 {calculateReadTime(article.body)} min read
                                </span>
                                <span>{new Date(article.publish_date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-3 group-hover:text-teal-700 transition-colors line-clamp-2">
                                {article.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
                                {article.body}
                            </p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 text-xs font-bold">
                                        {article.author_name?.[0] || 'A'}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{article.author_name}</span>
                                </div>
                                <span className="text-teal-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                    Read →
                                </span>
                            </div>
                        </div>
                        </Link>
                    </motion.div>
                    ))}
                </div>
            </>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
             <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-gray-500 text-lg">No articles found matching "{searchTerm}"</p>
            <button onClick={() => {setSearchTerm(''); setSelectedCategory('All')}} className="mt-4 text-emerald-600 font-bold hover:underline">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="mt-24 bg-emerald-900 text-white py-20 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
           <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
               <span className="bg-emerald-800 text-emerald-200 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">Stay Updated</span>
               <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Weekly Agronomy Tips</h2>
               <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
                   Join 15,000+ farmers receiving our weekly digest on market prices, pest alerts, and farming guides.
               </p>
               <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully!') }}>
                   <input type="email" placeholder="Enter your email address" className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/50" required />
                   <button type="submit" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-emerald-500/30">
                       Subscribe
                   </button>
               </form>
               <p className="text-emerald-400/60 text-xs mt-6">No spam, unsubscribe at any time.</p>
           </div>
      </section>

      {/* Video Tutorials Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-bold font-serif text-gray-900 mb-8 flex items-center gap-3">
             <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
             Video Tutorials
           </h2>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Video 1 */}
             <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
               <div className="aspect-video relative">
                 <iframe 
                   width="100%" 
                   height="100%" 
                   src="https://www.youtube.com/embed/nNi-mWj1rpE" 
                   title="Tomato Farming Guide" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-lg mb-2 group-hover:text-teal-700 transition-colors">Tomato Farming Guide</h3>
                 <p className="text-sm text-gray-600">Expert tips on managing tomatoes effectively.</p>
               </div>
             </div>

             {/* Video 2 */}
             <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
               <div className="aspect-video">
                 <iframe 
                   width="100%" 
                   height="100%" 
                   src="https://www.youtube.com/embed/RfFPo0jilro" 
                   title="Drip Irrigation Installation" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-lg mb-2 group-hover:text-teal-700 transition-colors">Drip Irrigation Installation</h3>
                 <p className="text-sm text-gray-600">Simple guide to setting up drip lines.</p>
               </div>
             </div>

             {/* Video 3 */}
             <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
               <div className="aspect-video">
                 <iframe 
                   width="100%" 
                   height="100%" 
                   src="https://www.youtube.com/embed/k_t_rB4x-sY" 
                   title="Maize Farming Tips" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
               </div>
               <div className="p-4">
                 <h3 className="font-bold text-lg mb-2 group-hover:text-teal-700 transition-colors">Maize Farming Tips</h3>
                 <p className="text-sm text-gray-600">Best practices for maize production.</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default Knowledge
