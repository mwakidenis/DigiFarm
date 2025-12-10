import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

const AddProduct = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '', 
    image: null
  })
  const [categories, setCategories] = useState([])
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/marketplace/categories/')
        // Handle pagination or direct list
        const data = res.data.results ? res.data.results : res.data
        if (Array.isArray(data)) {
            setCategories(data)
        } else {
            console.error('Invalid categories format:', data)
            setCategories([])
        }
      } catch (err) {
        console.error('Failed to fetch categories', err)
        toast.error('Could not load categories. Please refresh.')
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Validation
    if (!formData.category && categories.length > 0) {
        // If user didn't select, and we have categories, force select first or error?
        // Better to error or pick first if not mandatory. But it is usually mandatory.
        if (!formData.category) {
             toast.error('Please select a category')
             setLoading(false)
             return
        }
    }

    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('price', formData.price)
    data.append('stock', formData.stock)
    data.append('category_id', formData.category) // Ensure backend expects category_id
    
    if (formData.image) {
      data.append('images', formData.image) 
    }

    try {
      await api.post('/marketplace/products/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      toast.success('Product listed successfully!')
      // Force a small delay or state update if needed, but navigation should trigger re-fetch on Marketplace
      navigate('/marketplace')
    } catch (error) {
      console.error('Add Product Error:', error)
      toast.error('Failed to list product: ' + (error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List New Product</h1>
          <p className="text-gray-500">Sell your seeds, tools, or harvest to thousands of farmers.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="flex items-center gap-6">
                <div className={`w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${preview ? 'border-emerald-500' : 'border-gray-300'}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-2xl">📷</span>
                  )}
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
                  Choose Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Hybrid Tomato Seeds"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                 <select 
                   name="category"
                   required
                   className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                   value={formData.category}
                   onChange={handleChange}
                 >
                   <option value="">Select Category</option>
                   {categories.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                required
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Describe your product specs, quality, etc."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES)</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="100"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Listing Product...
                    </>
                ) : 'Publish Item'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default AddProduct
