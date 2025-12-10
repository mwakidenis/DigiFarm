import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
                <span className="text-3xl">🌱</span>
                <span className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">DigiFarm</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Empowering farmers with technology. Access markets, expert advice, and AI diagnosis tools all in one place.
            </p>
            <div className="flex gap-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map(social => (
                    <a key={social} href={`#${social}`} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all transform hover:-translate-y-1">
                        <span className="sr-only">{social}</span>
                        <div className="w-4 h-4 bg-current rounded-sm opacity-50" /> {/* Placeholder icon */}
                    </a>
                ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Platform</h3>
            <ul className="space-y-4">
              {['Marketplace', 'Diagnosis', 'Community', 'Farm Management'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-base text-gray-400 hover:text-emerald-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Support</h3>
            <ul className="space-y-4">
              {['Help Center', 'Documentation', 'Guides', 'API Status'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-base text-gray-400 hover:text-emerald-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
             <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Stay Updated</h3>
             <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter for farming tips.</p>
             <form className="flex gap-2 mb-6" onSubmit={(e) => e.preventDefault()}>
                 <input 
                    type="email" 
                    placeholder="Enter email" 
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
                 <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    →
                 </button>
             </form>
             <div className="text-sm text-gray-400">
                <p>📍 Nairobi, Kenya</p>
                <p>📞 +254 700 000 000</p>
             </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-base text-gray-500">
            &copy; {new Date().getFullYear()} DigiFarm. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
