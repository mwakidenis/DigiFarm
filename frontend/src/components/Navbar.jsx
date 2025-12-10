import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-3xl">🌾</span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                DigiFarm
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/marketplace" className="text-gray-700 hover:text-emerald-600 px-3 py-2 font-medium">
               Marketplace
            </Link>
            <Link to="/marketplace/cart" className="text-gray-700 hover:text-emerald-600 px-3 py-2 font-medium">
               Cart 🛒
            </Link>
            <Link to="/agri-bot" className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold hover:bg-emerald-200 transition-colors flex items-center gap-2">
               <span>🤖</span> Agri-Bot
            </Link>
            <Link to="/community" className="nav-link px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors font-medium">
              Community
            </Link>
            <Link to="/knowledge" className="nav-link px-4 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors font-medium">
              Knowledge
            </Link>
          </div>
          
          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 focus:outline-none"
                >
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold max-w-[100px] truncate">{user?.first_name || user?.email?.split('@')[0]}</span>
                  <span className="text-xs">▼</span>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2"
                    >
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                         👤 My Profile
                      </Link>
                      <Link 
                        to="/diagnosis" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                         🌿 AI Diagnosis
                      </Link>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🚪 Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium text-sm">
                  Login
                </Link>
                <Link to="/register" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 p-2"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-2 space-y-1">
              <Link to="/marketplace" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50">Marketplace</Link>
              <Link to="/community" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50">Community</Link>
              <Link to="/knowledge" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50">Knowledge</Link>
              
              {isAuthenticated ? (
                <>
                  <div className="h-px bg-gray-100 my-2"></div>
                  <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-600 bg-emerald-50">Dashboard</Link>
                  <Link to="/diagnosis" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700">Diagnosis</Link>
                   <Link to="/profile" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700">Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600">Logout</button>
                </>
              ) : (
                <>
                  <div className="h-px bg-gray-100 my-2"></div>
                  <Link to="/login" className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700">Login</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-600 font-bold">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
