'use client'

import { useState, useEffect } from 'react'
import { CloudIcon, SunIcon, EyeDropperIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface WeatherData {
  temperature: number
  humidity: number
  description: string
  windSpeed: number
  pressure: number
  visibility: number
}

interface WeatherRecommendation {
  category: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  icon: string
}

export default function WeatherPage() {
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recommendations, setRecommendations] = useState<WeatherRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ta'>('en')

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}&language=${language}`)
      const data = await response.json()

      if (data.success) {
        setWeather(data.weather)
        setRecommendations(data.recommendations)
        setLocation(data.location)
      }
    } catch (error) {
      console.error('Weather fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWeatherByLocation = async () => {
    if (!location.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/weather/current?location=${encodeURIComponent(location)}&language=${language}`)
      const data = await response.json()

      if (data.success) {
        setWeather(data.weather)
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Weather fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Weather-Based Farming Tips</h1>
        <p className="text-lg text-gray-600 font-tamil">வானிலை அடிப்படையிலான விவசாய குறிப்புகள்</p>
        <p className="text-gray-500 mt-2">Get personalized farming recommendations based on current weather conditions</p>
      </div>

      {/* Location Input */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={language === 'en' ? "Enter your location (e.g., Chennai, Tamil Nadu)" : "உங்கள் இடத்தை உள்ளிடவும்"}
            className="flex-1 input-field"
            onKeyPress={(e) => e.key === 'Enter' && fetchWeatherByLocation()}
          />
          <div className="flex space-x-2">
            <button
              onClick={getCurrentLocation}
              className="btn-secondary whitespace-nowrap"
            >
              Use Current Location
            </button>
            <button
              onClick={fetchWeatherByLocation}
              disabled={isLoading || !location.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? 'Loading...' : 'Get Weather'}
            </button>
          </div>
        </div>
      </div>

      {weather && (
        <>
          {/* Current Weather */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <SunIcon className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Temperature</h3>
              <p className="text-2xl font-bold text-orange-600">{weather.temperature}°C</p>
              <p className="text-sm text-gray-500 capitalize">{weather.description}</p>
            </div>

            <div className="card text-center">
              <EyeDropperIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Humidity</h3>
              <p className="text-2xl font-bold text-blue-600">{weather.humidity}%</p>
              <p className="text-sm text-gray-500">Moisture in air</p>
            </div>

            <div className="card text-center">
              <ArrowPathIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Wind Speed</h3>
              <p className="text-2xl font-bold text-gray-600">{weather.windSpeed} m/s</p>
              <p className="text-sm text-gray-500">Current wind</p>
            </div>

            <div className="card text-center">
              <CloudIcon className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Pressure</h3>
              <p className="text-2xl font-bold text-purple-600">{weather.pressure} hPa</p>
              <p className="text-sm text-gray-500">Atmospheric pressure</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Farming Recommendations
              <span className="block text-lg font-medium text-gray-600 font-tamil mt-1">
                விவசாய பரிந்துரைகள்
              </span>
            </h2>

            {recommendations.length > 0 ? (
              <div className="grid gap-6">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`card border-l-4 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{rec.icon}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(rec.priority)}`}>
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{rec.description}</p>
                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {rec.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CloudIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No specific recommendations for current weather conditions</p>
              </div>
            )}
          </div>

          {/* Weather Alerts */}
          <div className="card mt-8 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <CloudIcon className="w-6 h-6 mr-2" />
              Weather Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">General Guidelines:</h4>
                <ul className="space-y-1 text-blue-800">
                  <li>• Check weather forecast daily</li>
                  <li>• Plan irrigation based on rainfall</li>
                  <li>• Protect crops during extreme weather</li>
                  <li>• Monitor temperature for pest activity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2 font-tamil">பொதுவான வழிகாட்டுதல்கள்:</h4>
                <ul className="space-y-1 text-blue-800 font-tamil">
                  <li>• தினமும் வானிலை முன்னறிவிப்பைச் சரிபார்க்கவும்</li>
                  <li>• மழையின் அடிப்படையில் நீர்ப்பாசனத்தைத் திட்டமிடுங்கள்</li>
                  <li>• தீவிர வானிலையின் போது பயிர்களைப் பாதுகாக்கவும்</li>
                  <li>• பூச்சி செயல்பாட்டிற்கான வெப்பநிலையைக் கண்காணிக்கவும்</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {!weather && !isLoading && (
        <div className="text-center py-12">
          <CloudIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Get Weather-Based Recommendations</h3>
          <p className="text-gray-500 mb-4">Enter your location to receive personalized farming tips</p>
          <p className="text-sm text-gray-400 font-tamil">தனிப்பயனாக்கப்பட்ட விவசாய குறிப்புகளைப் பெற உங்கள் இடத்தை உள்ளிடவும்</p>
        </div>
      )}
    </div>
  )
}