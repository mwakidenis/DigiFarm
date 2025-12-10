
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

const VendorOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await api.get('/marketplace/orders/')
            const data = res.data.results || res.data
            if (Array.isArray(data)) {
                setOrders(data)
            } else {
                setOrders([])
                console.error("Orders response is not an array:", res.data)
            }
            setLoading(false)
        } catch (error) {
            toast.error('Failed to load orders')
            setLoading(false)
        }
    }

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/marketplace/orders/${orderId}/`, { status: newStatus })
            toast.success(`Order #${orderId} marked as ${newStatus}`)
            fetchOrders() // Refresh list
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
                    <p className="text-gray-500 mt-2">Track and update the status of your customer orders.</p>
                </div>

                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                >
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <span className="text-6xl mb-4 block">📦</span>
                            <h3 className="text-xl font-bold text-gray-900">No Orders Yet</h3>
                            <p className="text-gray-500">When you receive orders, they will appear here.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <motion.div 
                                key={order.id} 
                                variants={item}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white px-3 py-1 rounded-md border border-gray-200 text-sm font-bold text-gray-700">
                                            #{order.id}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                              order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                              order.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                                              order.status === 'shipped' ? 'bg-orange-100 text-orange-700' :
                                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                              'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-6">
                                    <div className="grid md:grid-cols-3 gap-8">
                                        {/* Items List */}
                                        <div className="md:col-span-2 space-y-4">
                                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">Items</h3>
                                            {order.items?.map(item => {
                                                if (!item?.product) return null; // Skip if product data is missing
                                                return (
                                                <div key={item.id} className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.product.images && item.product.images.length > 0 ? (
                                                            <img src={item.product.images[0].image} alt={item.product.title || 'Product'} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">🌱</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.product.title || 'Unknown Product'}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity} × KES {item.price}</p>
                                                    </div>
                                                    <div className="ml-auto font-bold text-gray-900">
                                                        KES {item.subtotal}
                                                    </div>
                                                </div>
                                                )
                                            })}
                                            <div className="flex justify-end pt-2">
                                                <p className="text-sm text-gray-500">Total Order Value:</p>
                                                <p className="font-bold text-emerald-600 text-lg ml-2">KES {order.total_amount}</p>
                                            </div>
                                        </div>

                                        {/* Actions & Details */}
                                        <div className="bg-gray-50 rounded-xl p-6 space-y-6 h-fit">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Customer</h3>
                                                <p className="text-gray-700 text-sm">{order.shipping_phone}</p>
                                                <p className="text-gray-500 text-xs mt-1">{order.shipping_county}</p>
                                                <p className="text-gray-500 text-xs">{order.shipping_address}</p>
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Update Status</h3>
                                                {order.status !== 'cancelled' ? (
                                                    <div className="space-y-2">
                                                        {order.status === 'paid' && (
                                                            <button 
                                                                onClick={() => updateStatus(order.id, 'processing')}
                                                                className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                                                            >
                                                                Mark as Processing
                                                            </button>
                                                        )}
                                                        {order.status === 'processing' && (
                                                            <button 
                                                                onClick={() => updateStatus(order.id, 'shipped')}
                                                                className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                                                            >
                                                                Mark as Shipped
                                                            </button>
                                                        )}
                                                        {order.status === 'shipped' && (
                                                            <button 
                                                                onClick={() => updateStatus(order.id, 'delivered')}
                                                                className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                                                            >
                                                                Mark as Delivered
                                                            </button>
                                                        )}
                                                        {['pending', 'paid'].includes(order.status) && (
                                                            <button 
                                                                onClick={() => updateStatus(order.id, 'cancelled')}
                                                                className="w-full bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}
                                                        {order.status === 'delivered' && (
                                                            <div className="text-center text-emerald-600 font-bold flex items-center justify-center gap-2">
                                                                <span>✅</span> Order Completed
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-red-500 font-bold bg-white p-2 rounded-lg border border-red-100">
                                                        ❌ Cancelled
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default VendorOrders
