import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import api from '../services/api'
import toast from 'react-hot-toast'

const ArticleDetail = () => {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticle()
  }, [slug])

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/knowledge/articles/${slug}/`)
      setArticle(response.data)
      
      // Fetch all articles to filter for related content (Simulated backend relationship)
      const allRes = await api.get('/knowledge/articles/')
      const allArticles = allRes.data.results || allRes.data || []
      
      // Filter related: Same category, not current article, max 3
      const related = allArticles
            .filter(a => a.category === response.data.category && a.slug !== slug)
            .slice(0, 3)
      setRelatedArticles(related)

      // Increment views
      api.post(`/knowledge/articles/${slug}/increment_views/`)
    } catch (error) {
      toast.error('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const calculateReadTime = (text) => {
    const wordsPerMinute = 200
    const words = text?.trim().split(/\s+/).length || 0
    return Math.ceil(words / wordsPerMinute)
  }

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    )
  }

  if (!article) {
    return <div className="text-center py-12">Article not found</div>
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
        {/* Hero Image */}
        {article.featured_image && (
            <div className="h-96 w-full relative">
                <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 md:p-12 text-white">
                    <div className="max-w-4xl mx-auto">
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            {article.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">{article.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-200">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                    {article.author?.email?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <span>{article.author?.email || 'Agro Team'}</span>
                             </div>
                             <span>•</span>
                             <span>{new Date(article.publish_date).toLocaleDateString()}</span>
                             <span>•</span>
                             <span>{calculateReadTime(article.body)} min read</span>
                             <span>•</span>
                             <span>{article.views} views</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-10">
        <article className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            {!article.featured_image && (
                <>
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>
                    <hr className="my-6 border-gray-100"/>
                </>
            )}
            
            <div className="prose prose-lg prose-emerald max-w-none">
                <ReactMarkdown>{article.body}</ReactMarkdown>
            </div>
        </article>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-emerald-500 pl-4">Related Articles</h3>
              <div className="grid md:grid-cols-3 gap-8">
                  {relatedArticles.map(rel => (
                      <Link key={rel.id} to={`/knowledge/article/${rel.slug}`} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden block">
                          <div className="h-48 overflow-hidden">
                              <img src={rel.featured_image} alt={rel.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"/>
                          </div>
                          <div className="p-6">
                              <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{rel.title}</h4>
                              <p className="text-sm text-gray-500">{new Date(rel.publish_date).toLocaleDateString()}</p>
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
      )}
    </div>
  )
}

export default ArticleDetail

