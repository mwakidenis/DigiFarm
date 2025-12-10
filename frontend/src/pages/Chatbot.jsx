import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Agri-Bot 🤖. Ask me anything about farming, prices, or crop diseases!", sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (query) => {
    const q = query.toLowerCase()
    
    if (q.includes('tomato')) {
        return "Tomatoes require warm weather and well-drained soil. Best varieties for Kenya include Anna F1 and Prostar. Don't forget to stake them!"
    }
    if (q.includes('maize')) {
        return "Maize planting season is usually Mar-Apr. Ensure you use certified seeds like H614 or DK8031 depending on your altitude. Top dress with CAN when knee-high."
    }
    if (q.includes('price') || q.includes('cost')) {
        return "Market prices fluctuate! Currently, a crate of tomatoes is approx KES 4,500 and a 90kg bag of maize is KES 3,200. Check our Marketplace for live deals."
    }
    if (q.includes('disease') || q.includes('blight')) {
        return "For blight, use fungicides like Ridomil Gold. Ensure good air circulation between plants. If leaves turn yellow, it might be Nitrogen deficiency."
    }
    if (q.includes('irrigation') || q.includes('water')) {
        return "Drip irrigation is the most efficient method, saving up to 50% water. It's perfect for tomatoes and vegetables."
    }
    if (q.includes('hello') || q.includes('hi')) {
        return "Hello farmer! How can I help you grow today? 🌱"
    }

    return "That's a great question! I'm still learning, but I recommend checking the Knowledge Hub for more detailed guides on that topic."
  }

  const handleSend = async (e) => {
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
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col p-4 sm:p-6">
        
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                🤖
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Agri-Bot Assistant</h1>
                <p className="text-sm text-green-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                </p>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow bg-white border-x border-gray-100 overflow-y-auto p-6 space-y-6 h-[600px] scrollbar-thin scrollbar-thumb-emerald-200">
            {messages.map((msg) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                        className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.sender === 'user' 
                                ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-500/20' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        } shadow-md`}
                    >
                        <p className="leading-relaxed">{msg.text}</p>
                    </div>
                </motion.div>
            ))}
            
            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none flex gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </motion.div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-2xl shadow-sm p-4 border-t border-gray-100">
            <form onSubmit={handleSend} className="flex gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crops, prices, pests..."
                    className="flex-grow px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400"
                />
                <button 
                    type="submit"
                    className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
                >
                    <span>Send</span>
                    <span>🚀</span>
                </button>
            </form>
        </div>

      </div>
    </div>
  )
}

export default Chatbot
