'use client'

import { useState, useEffect } from 'react'
import { BeakerIcon } from '@heroicons/react/24/outline'
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
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Soil Moisture Prediction</h1>
        <p className="text-lg text-gray-600 font-tamil">மண் ஈரப்பதம் கணிப்பு</p>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">Predict soil moisture levels without physical sensors using AI</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-green-700">
              <BeakerIcon className="w-6 h-6 mr-2" />
              Environmental Data
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temp (°C) / வெப்பநிலை</label>
                <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="input-field py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Humidity (%) / ஈரப்பதம்</label>
                <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} className="input-field py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rainfall (mm) / மழையளவு</label>
                <input type="number" name="rainfall" value={formData.rainfall} onChange={handleInputChange} className="input-field py-2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Crop Type / பயிர் வகை</label>
                <select name="cropType" value={formData.cropType} onChange={handleInputChange} className="input-field py-2.5">
                  <option value="">Select crop</option>
                  {cropTypes.map(c => <option key={c.value} value={c.value}>{language === 'ta' ? c.labelTamil : c.label}</option>)}
                </select>
              </div>
              {formData.cropType === 'other' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Crop Name / பயிர் பெயர்</label>
                  <input type="text" name="customCrop" value={formData.customCrop} onChange={handleInputChange} className="input-field py-2.5" placeholder="e.g. Jasmine" />
                </div>
              )}
              <button
                onClick={predictSoilMoisture}
                disabled={isLoading}
                className="w-full btn-primary py-3 flex items-center justify-center space-x-2 shadow-lg"
              >
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <BeakerIcon className="w-5 h-5" />}
                <span>{isLoading ? 'Predicting...' : 'Predict Moisture'}</span>
              </button>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-6 text-green-700">Analysis Results</h2>
            {prediction ? (
              <div className="space-y-6 text-center">
                <div className="py-8">
                  <div className="text-6xl font-black text-primary-600 mb-2">{prediction.moistureLevel}%</div>
                  <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getMoistureColor(prediction.moistureLevel)}`}>
                    {getMoistureStatus(prediction.moistureLevel)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                  <p className="font-bold text-gray-900 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Recommendation:
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">{prediction.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
                <BeakerIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-medium">Fill in the data to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* History Area */}
        <div className="card p-5 sm:p-6 h-fit shrink-0">
          <h2 className="text-lg font-semibold mb-6 text-green-700">Recent Activity</h2>
          <div className="space-y-3 max-h-[300px] lg:max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {history.length > 0 ? history.map((h: any) => (
              <div key={h.id} className="p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium">
                  <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                  <span className="text-primary-600 font-bold">{h.predictedMoisture}%</span>
                </div>
                <p className="text-xs font-bold capitalize text-gray-700">{h.cropType}</p>
              </div>
            )) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 mb-3">{session ? 'No history yet' : 'Login to save history'}</p>
                {!session && (
                  <Link href="/login" className="text-xs text-primary-600 font-bold hover:underline">
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