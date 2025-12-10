import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal } = useCart()
  const navigate = useNavigate()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link 
          to="/marketplace" 
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Browse Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {cartItems.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0].image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🌱</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.vendor_name}</p>
                  <p className="text-emerald-600 font-bold mt-1">KES {item.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 font-bold"
                  >
                    -
                  </button>
                  <span className="font-semibold w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="lg:w-1/3">
             <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
               
               <div className="space-y-3 mb-6">
                 <div className="flex justify-between text-gray-600">
                   <span>Subtotal</span>
                   <span>KES {subtotal}</span>
                 </div>
                 <div className="flex justify-between text-gray-600">
                   <span>Shipping Estimate</span>
                   <span>Calculated next</span>
                 </div>
                 <div className="h-px bg-gray-100 my-2" />
                 <div className="flex justify-between text-xl font-bold text-gray-900">
                   <span>Total</span>
                   <span>KES {subtotal}</span>
                 </div>
               </div>

               <Link 
                 to="/checkout"
                 className="block w-full bg-emerald-600 text-white text-center py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30"
               >
                 Proceed to Checkout
               </Link>
               
               <p className="text-xs text-center text-gray-400 mt-4">Safe & Secure Payment via M-Pesa</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Cart
