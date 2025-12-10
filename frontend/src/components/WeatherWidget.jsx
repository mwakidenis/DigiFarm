import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    // Mock weather data - in a real app this would fetch from an API
    setWeather({
      temp: 24,
      condition: 'Partly Cloudy',
      humidity: 65,
      forecast: 'Rain likely in the evening'
    })
  }, [])

  if (!weather) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white text-left shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Field Weather</h3>
          <p className="text-blue-100 text-sm">Nairobi, KE</p>
        </div>
        <div className="text-4xl">⛅</div>
      </div>
      
      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-bold">{weather.temp}°</span>
        <span className="text-xl mb-1">C</span>
      </div>
      
      <div className="space-y-2 text-blue-100 text-sm">
        <div className="flex justify-between">
          <span>Humidity</span>
          <span className="font-semibold">{weather.humidity}%</span>
        </div>
        <div className="flex justify-between">
          <span>Condition</span>
          <span className="font-semibold">{weather.condition}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/20 text-xs">
        <span className="font-semibold">💡 Tip:</span> {weather.forecast}
      </div>
    </motion.div>
  )
}

export default WeatherWidget
