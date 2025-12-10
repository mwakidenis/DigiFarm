import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import WeatherWidget from '../components/WeatherWidget'

const Home = () => {
  const { isAuthenticated } = useAuth()

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="font-sans antialiased overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white min-h-[90vh] flex items-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={stagger}
            >
              <motion.div variants={fadeIn} className="inline-block bg-white/10 backdrop-blur-sm border border-emerald-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-emerald-300 mb-6">
                🚀 Revolutionizing Agriculture
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                Farming, <br />Reimagined.
              </motion.h1>
              <motion.p variants={fadeIn} className="text-lg md:text-xl text-emerald-100 mb-8 max-w-lg leading-relaxed">
                Connect with AI diagnostics, certified inputs, and a thriving community. The all-in-one platform for modern farmers.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/diagnosis" className="group relative px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] overflow-hidden">
                  <span className="relative z-10">Start Diagnosis</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link to="/marketplace" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white font-semibold rounded-xl backdrop-blur-md transition-all">
                  Browse Market
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeIn} className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <div>
                  <p className="text-3xl font-bold text-white">15K+</p>
                  <p className="text-sm text-emerald-400/80">Active Farmers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">98%</p>
                  <p className="text-sm text-emerald-400/80">Accuracy Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">24/7</p>
                  <p className="text-sm text-emerald-400/80">AI Support</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Visual/Widget Side */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative mt-12 lg:mt-0"
            >
              <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
                <WeatherWidget />
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -bottom-10 -left-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 w-64"
                >
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 text-xl">🌿</div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">New Diagnosis</p>
                    <p className="text-xs text-gray-500">Tomato Early Blight detected</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Core Features</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Everything you need to grow</h3>
            <p className="text-gray-600 text-lg">Powerful tools integrating cutting-edge technology with traditional farming wisdom.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "AI Crop Doctor",
                desc: "Snap a photo of your sick crop. Our AI identifies diseases instantly and prescribes the perfect treatment plan.",
                link: "/diagnosis",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: "🛒",
                title: "Smart Marketplace",
                desc: "Order certified seeds and inputs. We connect you directly with verified vendors for quality assurance.",
                link: "/marketplace",
                color: "bg-emerald-50 text-emerald-600"
              },
              {
                icon: "🤝",
                title: "Farmer Community",
                desc: "Join thousands of farmers. Share tips, ask questions, and learn from experts in our localized forums.",
                link: "/community",
                color: "bg-purple-50 text-purple-600"
              }
            ].map((feature, i) => (
              <motion.div 
                key={feature.title}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.desc}</p>
                <Link to={feature.link} className="inline-flex items-center text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                  Try it out <span className="ml-2">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Teaser */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-900 rounded-[2.5rem] p-12 md:p-24 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-white text-3xl md:text-5xl font-bold mb-6">Join the conversation</h3>
                <p className="text-emerald-200 text-lg mb-8">
                  Get real-time advice from seasoned farmers and agronomists. Don't farm alone.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    "💬 Active discussions on market prices",
                    "🌦️ Localized weather updates",
                    "🚜 Equipment sharing networks"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/90">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</div>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-10">
                  <Link to="/community" className="bg-white text-emerald-900 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors inline-block">
                    Visit Community Hub
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full"></div>
                    <div>
                      <div className="h-2 w-24 bg-white/40 rounded mb-2"></div>
                      <div className="h-2 w-16 bg-white/20 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-white/20 rounded"></div>
                    <div className="h-2 w-full bg-white/20 rounded"></div>
                    <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl text-emerald-900 w-64">
                   <p className="text-sm font-bold">"This app saved my harvest!"</p>
                   <p className="text-xs text-gray-500 mt-1">- John K., Kitale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to transform your farm?</h2>
          <p className="text-gray-600 mb-8 text-lg">Join thousands of farmers making smarter decisions every day.</p>
          <div className="flex justify-center gap-4">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/30 transition-all">
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
