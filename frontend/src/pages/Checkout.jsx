import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { mpesaService } from '../services/mpesaService'
import { motion } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

const Checkout = () => {
  const { user } = useAuth()
  const { cartItems, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  
  const [orderData, setOrderData] = useState({
    shipping_address: '',
    shipping_county: '',
    shipping_phone: user?.phone_number || '',
  })
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState(null)
  
  const isDev = true 

  useEffect(() => {
    if (cartItems.length === 0 && !order) {
       toast('Your cart is empty', { icon: '🛒' })
       navigate('/marketplace')
    }
  }, [cartItems, navigate, order])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const hasDemoItems = cartItems.some(item => String(item.id).startsWith('demo'))
    if (hasDemoItems) {
        toast.error('Demo products cannot be purchased. Please list a new product to test checkout.')
        return
    }

    setProcessing(true)

    const orderItemsPayload = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
    }))

    try {
      const response = await api.post('/marketplace/orders/', {
          ...orderData,
          order_items: orderItemsPayload
      })
      setOrder(response.data)
      clearCart() 
      toast.success('Order created! Proceed to payment')
    } catch (error) {
      console.error('Order creation error:', error)
      toast.error('Failed to create order: ' + (error.response?.data?.error || JSON.stringify(error.response?.data) || error.message))
    } finally {
        setProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (!order) return

    setProcessing(true)
    const phoneToUse = orderData.shipping_phone

    try {
      await mpesaService.initiateSTKPush(
        order.id,
        phoneToUse
      )
      toast.success('Payment request sent! Check your phone.')
      toast.loading('Waiting for M-Pesa confirmation...', { duration: 5000 })
      setProcessing(false)
    } catch (error) {
      console.error('Payment Error:', error)
      toast.error('Payment failed: ' + (error.response?.data?.error || error.message))
      setProcessing(false)
    }
  }

  const handleSimulatePayment = async () => {
      if (!order) return
      setProcessing(true)
      try {
          toast.loading('Simulating payment...')
          
          let checkoutReqId = 'ws_CO_SIMULATED_' + Date.now();
          
          try {
             const res = await mpesaService.initiateSTKPush(order.id, orderData.shipping_phone);
             if (res.checkout_request_id) {
                 checkoutReqId = res.checkout_request_id;
             }
          } catch (e) {
             console.warn('STK Init failed during simulation setup, using fake ID', e);
          }

          await mpesaService.simulateWebhook(checkoutReqId, 0, 'SIM' + Date.now());
          toast.dismiss();
          toast.success('Payment Simulated Successfully!');
          navigate('/dashboard');
          
      } catch (error) {
          toast.error('Simulation failed: ' + error.message)
      } finally {
          setProcessing(false)
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-2">Secure your order with M-Pesa</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-8">
            {!order ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <h3 className="font-bold text-gray-700 mb-2">Order Review</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        {cartItems.map(item => (
                            <li key={item.id} className="flex justify-between">
                                <span>{item.title} x {item.quantity}</span>
                                <span>KES {item.price * item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-gray-200 mt-3 pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total to Pay</span>
                        <span>KES {subtotal}</span>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    rows="3"
                    value={orderData.shipping_address}
                    onChange={(e) => setOrderData({ ...orderData, shipping_address: e.target.value })}
                    required
                    placeholder="Enter your delivery location..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={orderData.shipping_county}
                      onChange={(e) => setOrderData({ ...orderData, shipping_county: e.target.value })}
                      required
                      placeholder="e.g. Kiambu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="0712345678"
                      value={orderData.shipping_phone}
                      onChange={(e) => setOrderData({ ...orderData, shipping_phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {processing ? 'Creating Order...' : `Proceed to Pay KES ${subtotal}`}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                  📦
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
                <p className="text-gray-500 mb-8">Order #{order.id}</p>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-sm mx-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">KES {order.total_amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="h-px bg-gray-200 my-4" />
                  <div className="flex justify-between items-center text-lg font-bold text-emerald-700">
                    <span>Total</span>
                    <span>KES {order.total_amount}</span>
                  </div>
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                    <button
                      onClick={handlePayment}
                      disabled={processing}
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 flex justify-center items-center gap-2"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay with M-Pesa'
                      )}
                    </button>

                    {isDev && (
                        <button
                          onClick={handleSimulatePayment}
                          disabled={processing}
                          className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-200 text-sm"
                        >
                           Simulate Successful Payment (Dev)
                        </button>
                    )}
                </div>
                
                <p className="text-xs text-gray-400 mt-6">Secure payment via Daraja API</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Checkout
