
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

const UserOrders = () => {
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
            }
            setLoading(false)
        } catch (error) {
            toast.error('Failed to load orders')
            setLoading(false)
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
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

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
                            <p className="text-gray-500">Go to the marketplace to place your first order.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <motion.div 
                                key={order.id} 
                                variants={item}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
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

                                {/* Items */}
                                <div className="space-y-4 mb-6">
                                    {order.items?.map(item => {
                                        if (!item?.product) return null
                                        return (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.product.images?.[0]?.image ? (
                                                        <img src={item.product.images[0].image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">🌱</div>
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-medium text-gray-900">{item.product.title || 'Unknown Product'}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-gray-900">KES {item.subtotal}</p>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Timeline */}
                                <OrderTimeline status={order.status} />

                                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Total Amount</span>
                                    <span className="text-xl font-bold text-emerald-600">KES {order.total_amount}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    )
}

const OrderTimeline = ({ status }) => {
    const steps = ['pending', 'paid', 'processing', 'shipped', 'delivered']
    const currentStepIndex = steps.indexOf(status === 'cancelled' ? 'pending' : status)
    const isCancelled = status === 'cancelled'

    return (
        <div className="relative flex items-center justify-between w-full mt-4 px-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
            <div 
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500`}
                style={{ width: isCancelled ? '100%' : `${(currentStepIndex / (steps.length - 1)) * 100}%`, backgroundColor: isCancelled ? '#ef4444' : '' }}
            ></div>

            {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex
                const isActive = idx === currentStepIndex
                
                return (
                    <div key={step} className="relative z-10 flex flex-col items-center group">
                        <div 
                            className={`w-3 h-3 rounded-full border-2 transition-colors ${
                                isCancelled ? 'bg-red-500 border-red-500' :
                                isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'
                            }`}
                        />
                        <span className={`absolute top-5 text-[10px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${isCancelled ? 'text-red-500' : 'text-emerald-600'}`}>
                            {isCancelled ? 'Cancelled' : step}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default UserOrders
