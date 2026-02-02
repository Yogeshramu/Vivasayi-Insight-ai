'use client'

import { useState, useEffect } from 'react'
import { BeakerIcon, CloudIcon, SunIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface SoilPrediction {
  moistureLevel: number
  recommendation: string
  irrigationNeeded: boolean
  nextCheck: string
}

export default function SoilPredictionPage() {
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    rainfall: '',
    cropType: '',
    customCrop: '',
    season: '',
    location: ''
  })
  const { data: session } = useSession()
  const [prediction, setPrediction] = useState<SoilPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ta'>('en')
  const [history, setHistory] = useState<any[]>([])

  const cropTypes = [
    { value: 'rice', label: 'Rice', labelTamil: 'அரிசி' },
    { value: 'wheat', label: 'Wheat', labelTamil: 'கோதுமை' },
    { value: 'corn', label: 'Corn', labelTamil: 'சோளம்' },
    { value: 'tomato', label: 'Tomato', labelTamil: 'தக்காளி' },
    { value: 'cotton', label: 'Cotton', labelTamil: 'பருத்தி' },
    { value: 'sugarcane', label: 'Sugarcane', labelTamil: 'கரும்பு' },
    { value: 'banana', label: 'Banana', labelTamil: 'வாழை' },
    { value: 'coconut', label: 'Coconut', labelTamil: 'தேங்காய்' },
    { value: 'groundnut', label: 'Groundnut', labelTamil: 'நிலக்கடலை' },
    { value: 'turmeric', label: 'Turmeric', labelTamil: 'மஞ்சள்' },
    { value: 'chilli', label: 'Chilli', labelTamil: 'மிளகாய்' },
    { value: 'onion', label: 'Onion', labelTamil: 'வெங்காயம்' },
    { value: 'other', label: 'Other', labelTamil: 'மற்றவை' }
  ]

  const seasons = [
    { value: 'summer', label: 'Summer', labelTamil: 'கோடை' },
    { value: 'monsoon', label: 'Monsoon', labelTamil: 'மழைக்காலம்' },
    { value: 'winter', label: 'Winter', labelTamil: 'குளிர்காலம்' },
    { value: 'spring', label: 'Spring', labelTamil: 'வசந்தம்' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/soil/history')
      const data = await response.json()
      if (data.success) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('History fetch error:', error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchHistory()
    } else {
      setHistory([])
    }
  }, [session])

  const predictSoilMoisture = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/soil/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cropType: formData.cropType === 'other' ? formData.customCrop : formData.cropType,
          language
        })
      })

      const data = await response.json()

      if (data.success) {
        setPrediction(data.prediction)
        fetchHistory()
      } else {
        throw new Error(data.error || 'Prediction failed')
      }
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMoistureColor = (level: number) => {
    if (level < 30) return 'text-red-600 bg-red-50'
    if (level < 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getMoistureStatus = (level: number) => {
    if (level < 30) return language === 'en' ? 'Low' : 'குறைவு'
    if (level < 60) return language === 'en' ? 'Moderate' : 'மிதமான'
    return language === 'en' ? 'High' : 'அதிகம்'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Soil Moisture Prediction</h1>
        <p className="text-lg text-gray-600 font-tamil">மண் ஈரப்பதம் கணிப்பு</p>
        <p className="text-gray-500 mt-2">Predict soil moisture levels without physical sensors using AI</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-3 grid md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-green-700">
              <BeakerIcon className="w-6 h-6 mr-2" />
              Environmental Data
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temp (°C) / வெப்பநிலை</label>
                <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Humidity (%) / ஈரப்பதம்</label>
                <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rainfall (mm) / மழையளவு</label>
                <input type="number" name="rainfall" value={formData.rainfall} onChange={handleInputChange} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Crop Type / பயிர் வகை</label>
                <select name="cropType" value={formData.cropType} onChange={handleInputChange} className="input-field py-2">
                  <option value="">Select crop</option>
                  {cropTypes.map(c => <option key={c.value} value={c.value}>{language === 'ta' ? c.labelTamil : c.label}</option>)}
                </select>
              </div>
              {formData.cropType === 'other' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Enter Crop Name / பயிர் பெயரை உள்ளிடவும்</label>
                  <input type="text" name="customCrop" value={formData.customCrop} onChange={handleInputChange} className="input-field py-2" placeholder="e.g. Jasmine" />
                </div>
              )}
              <button
                onClick={predictSoilMoisture}
                disabled={isLoading}
                className="w-full btn-primary py-2 flex items-center justify-center space-x-2"
              >
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <BeakerIcon className="w-4 h-4" />}
                <span>{isLoading ? 'Predicting...' : 'Predict Moisture'}</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Results</h2>
            {prediction ? (
              <div className="space-y-4 text-center">
                <div className="text-5xl font-bold text-primary-600">{prediction.moistureLevel}%</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getMoistureColor(prediction.moistureLevel)}`}>
                  {getMoistureStatus(prediction.moistureLevel)}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-left text-sm">
                  <p className="font-bold mb-1">Recommendation:</p>
                  <p className="text-gray-600">{prediction.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                <BeakerIcon className="w-16 h-16 mb-4" />
                <p>Fill form to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* History Area */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-green-700">Recent</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {history.length > 0 ? history.map((h: any) => (
              <div key={h.id} className="p-2 border rounded hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                  <span className="font-bold">{h.predictedMoisture}%</span>
                </div>
                <p className="text-xs font-semibold capitalize">{h.cropType}</p>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-xs text-gray-400 mb-2">{session ? 'No history yet' : 'Login to save history'}</p>
                {!session && (
                  <Link href="/login" className="text-[10px] text-primary-600 font-bold hover:underline">
                    Sign In →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}