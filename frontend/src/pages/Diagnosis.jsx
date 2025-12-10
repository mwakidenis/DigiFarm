import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

const Diagnosis = () => {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [diagnosis, setDiagnosis] = useState(null)
  const [polling, setPolling] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
      // Reset diagnosis when new file selected
      setDiagnosis(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await api.post('/diagnosis/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      toast.success('Image uploaded! AI is analyzing...')
      const diagnosisId = response.data.id
      pollDiagnosis(diagnosisId)
    } catch (error) {
      toast.error('Upload failed: ' + (error.response?.data?.error || error.message))
      setUploading(false)
    }
  }

  const pollDiagnosis = async (diagnosisId) => {
    setPolling(true)
    const maxAttempts = 30
    let attempts = 0

    const poll = async () => {
      try {
        const response = await api.get(`/diagnosis/upload/${diagnosisId}/result/`)
        const result = response.data

        if (result.status === 'processed' && result.diagnosis_result) {
          setDiagnosis(result.diagnosis_result)
          setPolling(false)
          setUploading(false)
          toast.success('Diagnosis complete!')
        } else if (result.status === 'failed') {
          toast.error('Diagnosis processing failed')
          setPolling(false)
          setUploading(false)
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 2000)
        } else {
          toast.error('Diagnosis is taking longer than expected')
          setPolling(false)
          setUploading(false)
        }
      } catch (error) {
        toast.error('Failed to fetch diagnosis result')
        setPolling(false)
        setUploading(false)
      }
    }

    poll()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-emerald-100 rounded-2xl mb-4 text-3xl">🌿</div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">AI Crop Doctor</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your crop leaf. Our advanced AI will detect diseases and prescribe the perfect treatment instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Upload Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="p-8">
              <div 
                className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all ${
                  preview ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
                }`}
              >
                {!preview ? (
                  <label className="cursor-pointer block">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                      📸
                    </div>
                    <span className="text-gray-900 font-bold text-lg block mb-1">Upload Photo</span>
                    <span className="text-gray-500 text-sm">JPEG or PNG, Max 10MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img 
                      src={preview} 
                      alt="Crop Preview" 
                      className="w-full h-64 object-cover rounded-xl shadow-sm" 
                    />
                    <button 
                      onClick={() => { setFile(null); setPreview(null); setDiagnosis(null); }}
                      className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:text-red-700 shadow-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleUpload}
                  disabled={uploading || polling || !file}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
                >
                  {uploading || polling ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {polling ? 'Analyzing Crop...' : 'Uploading...'}
                    </>
                  ) : (
                    'Diagnose Issue'
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  By uploading, you agree to our Terms of Use.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AnimatePresence mode="wait">
              {diagnosis ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100"
                >
                  <div className="bg-emerald-600 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">Analysis Complete</h2>
                    <p className="text-emerald-100 text-sm">Confidence: {(diagnosis.confidence * 100).toFixed(1)}%</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Detected Issue</h3>
                      <p className="text-3xl font-bold text-gray-900">{diagnosis.predicted_label}</p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="flex gap-3">
                        <span className="text-2xl">💊</span>
                        <div>
                          <h4 className="font-bold text-orange-900">Treatment Plan</h4>
                          <p className="text-orange-800/80 text-sm mb-2">{diagnosis.recommendations.issue}</p>
                          <ul className="space-y-1">
                            {diagnosis.recommendations.treatment?.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-orange-400 mt-1">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {diagnosis.recommendations.recommended_products?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3">Recommended Products</h3>
                        <div className="space-y-3">
                          {diagnosis.recommendations.recommended_products.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-emerald-50 transition-colors">
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category}</p>
                              </div>
                              <Link to="/marketplace" className="text-emerald-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                Buy Now →
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                   key="placeholder"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="bg-gray-50 rounded-3xl p-8 text-center border-2 border-dashed border-gray-200 h-full flex flex-col justify-center items-center min-h-[400px]"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50">
                    🔬
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No Analysis Yet</h3>
                  <p className="text-gray-400 max-w-xs mx-auto">
                    Upload an image to see the detailed diagnosis and treatment recommendations here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        
        </div>
      </div>
    </div>
  )
}

export default Diagnosis
