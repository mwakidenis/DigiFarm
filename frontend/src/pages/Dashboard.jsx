import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import api from '../services/api'
import WeatherWidget from '../components/WeatherWidget'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchStats()
    if (user?.role !== 'admin') {
        fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
      try {
          const res = await api.get('/marketplace/orders/')
          setOrders(res.data.results || res.data)
      } catch (err) {
          console.error("Failed to fetch orders", err)
      }
  }

  const fetchStats = async () => {
    try {
      // In a real implementation, we would fetch role-specific stats endpoints
      // Simulating API latency and different responses based on role
      setTimeout(() => {
        if (user?.role === 'admin') {
            setStats({
                total_users: 1240,
                total_revenue: 'KES 2.4M',
                active_farms: 850,
                pending_verifications: 12,
                recent_activity: [
                    { id: 1, type: 'system', text: 'New vendor registration: Kenya Seed', time: '10 mins ago', icon: '🏢' },
                    { id: 2, type: 'alert', text: 'Server load peak detected', time: '1 hour ago', icon: '⚠️' },
                    { id: 3, type: 'user', text: 'verified 5 new farmers', time: '4 hours ago', icon: '✅' }
                ]
            })
        } else if (user?.role === 'vendor') {
            setStats({
                products: 45,
                sales: 'KES 125,000',
                orders_pending: 8,
                rating: 4.8,
                recent_activity: [
                    { id: 1, type: 'order', text: 'New order #1234 for 50kg Fertilizer', time: '5 mins ago', icon: '📦' },
                    { id: 2, type: 'rating', text: 'Received 5-star review', time: '2 hours ago', icon: '⭐' },
                    { id: 3, type: 'stock', text: 'Tomato Seeds low on stock', time: '1 day ago', icon: '📉' }
                ]
            })
        } else {
            // Farmer (Default)
            setStats({
                farms: 2,
                diagnoses: 12,
                orders: 5,
                recent_activity: [
                    { id: 1, type: 'diagnosis', text: 'Diagnosed Tomato Blight', time: '2 hours ago', icon: '🔍' },
                    { id: 2, type: 'order', text: 'Ordered NPK Fertilizer', time: '1 day ago', icon: '🛒' },
                    { id: 3, type: 'community', text: 'Posted in "Pest Control"', time: '2 days ago', icon: '💬' },
                ]
            })
        }
        setLoading(false)
      }, 800)
    } catch (error) {
      toast.error('Failed to load statistics')
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

  const getRoleBadge = () => {
      switch(user?.role) {
          case 'admin': return <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">Admin</span>
          case 'vendor': return <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">Vendor</span>
          default: return <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">Farmer</span>
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">
                Good morning, <span className="text-emerald-600">{user?.first_name || user?.email?.split('@')[0]}</span>! ☀️
                </h1>
                {getRoleBadge()}
            </div>
            <p className="text-gray-500">
                {user?.role === 'admin' ? 'System overview and management.' : 
                 user?.role === 'vendor' ? 'Manage your shop and orders.' : 
                 "Here's what's happening on your farm."}
            </p>
          </div>
          
          <div className="flex gap-3">
            {user?.role === 'vendor' && (
                <Link to="/marketplace/add" className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30">
                    <span>➕</span> List Product
                </Link>
            )}
            {user?.role === 'farmer' && (
                <Link to="/diagnosis" className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30">
                    <span>📷</span> New Diagnosis
                </Link>
            )}
            {user?.role === 'admin' && (
                 <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2">
                    <span>⚙️</span> Settings
                 </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Grid - Dynamic based on Role */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {user?.role === 'admin' ? (
                  <>
                     <StatCard label="Total Users" value={stats.total_users} icon="👥" color="bg-blue-50 text-blue-600" />
                     <StatCard label="Revenue" value={stats.total_revenue} icon="💰" color="bg-emerald-50 text-emerald-600" />
                     <StatCard label="Pending Verifications" value={stats.pending_verifications} icon="🛡️" color="bg-orange-50 text-orange-600" />
                  </>
              ) : user?.role === 'vendor' ? (
                  <>
                     <StatCard label="Active Listings" value={stats.products} icon="🏷️" color="bg-blue-50 text-blue-600" link="/marketplace" />
                     <StatCard label="Total Sales" value={stats.sales} icon="📈" color="bg-emerald-50 text-emerald-600" />
                     <StatCard label="Manage Orders" value={stats.orders_pending} icon="🔔" color="bg-purple-50 text-purple-600" link="/marketplace/orders" />
                  </>
              ) : (
                  <>
                     <StatCard label="My Farms" value={stats.farms} icon="🚜" color="bg-blue-50 text-blue-600" link="/farms" />
                     <StatCard label="Diagnoses" value={stats.diagnoses} icon="🌿" color="bg-emerald-50 text-emerald-600" link="/diagnosis" />
                     <StatCard label="Orders" value={stats.orders} icon="📦" color="bg-purple-50 text-purple-600" link="/orders" />
                  </>
              )}
            </motion.div>

            {/* My Orders Section - For Farmers/Users */}
            {user?.role !== 'admin' && orders.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
                        <Link to="/orders" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">View All →</Link>
                    </div>
                    <div className="space-y-6">
                        {orders.slice(0, 3).map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-6">
                {stats?.recent_activity?.map((act, i) => (
                  <div key={act.id} className="flex gap-4 items-start relative">
                    {i !== stats.recent_activity.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 z-10">
                      {act.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{act.text}</p>
                      <p className="text-xs text-gray-500">{act.time}</p>
                    </div>
                  </div>
                ))}
                {!stats?.recent_activity?.length && (
                  <p className="text-gray-500 text-sm">No recent activity.</p>
                )}
              </div>
            </motion.div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {user?.role === 'farmer' && <WeatherWidget />}
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white text-center shadow-lg">
              <h3 className="font-bold text-lg mb-2">
                  {user?.role === 'vendor' ? 'Boost your Sales' : 'Grow your knowledge'}
              </h3>
              <p className="text-gray-300 text-sm mb-6">
                  {user?.role === 'vendor' ? 'Learn how to optimize your listings.' : 'Discover expert guides and tips.'}
              </p>
              <Link to="/knowledge" className="inline-block w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-semibold transition-colors">
                Visit Hub
              </Link>
            </div>
            
            {user?.role === 'admin' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">Generate Reports</button>
                        <Link to="/admin/users" className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">Manage Users</Link>
                        <Link to="/admin/orders" className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">Review Orders</Link>
                    </div>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// Helper Component for Stats
const StatCard = ({ label, value, icon, color, link }) => {
    const content = (
        <div className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color}`}>
                {icon}
            </div>
            {link && <span className="text-gray-400 text-xs">View</span>}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    )

    return link ? <Link to={link}>{content}</Link> : <div>{content}</div>
}

const OrderCard = ({ order }) => {
    const steps = ['pending', 'paid', 'processing', 'shipped', 'delivered']
    const currentStepIndex = steps.indexOf(order?.status || 'pending')
    const isCancelled = order?.status === 'cancelled'

    if (!order) return null

    return (
        <div className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-gray-900">Order #{order.id}</h4>
                    <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} Items
                    </p>
                </div>
                <span className="font-bold text-emerald-600">KES {order.total_amount}</span>
            </div>

            {/* Status Timeline */}
             <div className="relative flex items-center justify-between w-full mt-2">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
                {/* Active Progress Bar */}
                <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500`}
                    style={{ width: isCancelled ? '100%' : `${(currentStepIndex / (steps.length - 1)) * 100}%`, backgroundColor: isCancelled ? '#ef4444' : '' }}
                ></div>

                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex
                    const isActive = idx === currentStepIndex
                    
                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                            <div 
                                className={`w-3 h-3 rounded-full border-2  ${
                                    isCancelled ? 'bg-red-500 border-red-500' :
                                    isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'
                                }`}
                            />
                             {isActive && (
                                <span className={`absolute top-5 text-[10px] font-bold uppercase tracking-wider ${isCancelled ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {isCancelled ? 'Cancelled' : step}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
            {isCancelled && <p className="text-xs text-red-500 mt-6 text-center font-medium">This order has been cancelled.</p>}
        </div>
    )
}

export default Dashboard
