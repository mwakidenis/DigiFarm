import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Agri-Bot 🤖. Ask me anything about crops, prices, or diseases!", sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const location = useLocation()

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const generateResponse = (query) => {
    const q = query.toLowerCase()
    
    if (q.includes('tomato')) return "Tomatoes generally require warm weather. Common issues include Early Blight. Use staking for better yield."
    if (q.includes('maize')) return "For Maize, ensure proper spacing (75x25cm). Top dress when knee-high. Watch out for Fall Armyworm!"
    if (q.includes('price')) return "Market prices vary daily. Check our Marketplace for the latest updates from verified vendors."
    if (q.includes('blight')) return "Blight is fungal. Remove infected leaves immediately and apply copper-based fungicides if severe."
    if (q.includes('help')) return "I can help with crop advice, pest diagnosis, market info, and general farming tips."
    
    return "I'm still learning! Try asking about tomatoes, maize, prices, or specific diseases."
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI delay
    setTimeout(() => {
        const botResponse = { 
            id: Date.now() + 1, 
            text: generateResponse(userMsg.text), 
            sender: 'bot' 
        }
        setMessages(prev => [...prev, botResponse])
        setIsTyping(false)
    }, 1200)
  }

  // Hide on login/register pages if desired, but let's keep it generally
  if (['/login', '/register'].includes(location.pathname)) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 sm:w-96 mb-4 overflow-hidden flex flex-col"
            style={{ maxHeight: '600px', height: '500px' }}
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                    <h3 className="font-bold text-sm">Agri-Bot</h3>
                    <p className="text-xs text-emerald-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> Online
                    </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white hover:bg-emerald-500 rounded-full p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                            msg.sender === 'user' 
                                ? 'bg-emerald-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                        }`}
                    >
                        {msg.text}
                    </div>
                </div>
              ))}
              {isTyping && (
                 <div className="flex justify-start">
                    <div className="bg-gray-200 p-2 rounded-xl rounded-bl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 px-4 py-2 text-sm rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim()}
                        className="bg-emerald-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ➤
                    </button>
                </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-emerald-500/40 flex items-center justify-center text-3xl transition-all z-50 border-2 border-white"
        aria-label="Toggle Chat"
      >
        {isOpen ? '✕' : '💬'}
      </motion.button>

    </div>
  )
}

export default ChatWidget
