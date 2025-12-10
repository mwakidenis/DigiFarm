import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/marketplace/products/${id}/`)
      setProduct(response.data)
    } catch (error) {
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    // In a full implementation, you'd manage cart state
    toast.success('Added to cart!')
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.images?.[0] && (
            <img
              src={product.images[0].image}
              alt={product.title}
              className="w-full rounded-lg"
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <div className="flex items-center space-x-2 mb-4">
             <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide">
               {product.category?.name || 'Product'}
             </span>
          </div>
          <p className="text-3xl font-bold text-primary-600 mb-4">KES {product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input-field w-32"
              />
            </div>
            <p className="text-sm text-gray-600">Stock: {product.stock}</p>
          </div>

          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="btn-primary w-full py-3"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

