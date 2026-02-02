'use client'

import { useState, useRef, useEffect } from 'react'
import { CameraIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

interface AnalysisResult {
  disease: string
  confidence: number
  treatment: string
  severity: 'low' | 'medium' | 'high'
}

export default function CropAnalysisPage() {
  const { data: session } = useSession()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [language, setLanguage] = useState<'en' | 'ta'>('en')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setResult(null)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('image', selectedImage)
    formData.append('language', language)

    try {
      const response = await fetch('/api/crop/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.result)
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      // Show error message
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const [history, setHistory] = useState<any[]>([])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/crop/history')
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Disease Analysis</h1>
        <p className="text-lg text-gray-600 font-tamil">பயிர் நோய் பகுப்பாய்வு</p>
        <p className="text-gray-500 mt-2">Upload a photo of your crop to detect diseases and get treatment recommendations</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Upload Section */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Upload Crop Image</h2>

              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Crop preview"
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                        setResult(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                  >
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload crop image</p>
                    <p className="text-sm text-gray-500 font-tamil">பயிர் படத்தை பதிவேற்ற கிளிக் செய்யவும்</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Upload Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2 text-sm"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    <span>Choose File</span>
                  </button>
                  <button
                    onClick={async () => {
                      await analyzeImage()
                      fetchHistory()
                    }}
                    disabled={!selectedImage || isAnalyzing}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <CameraIcon className="w-4 h-4" />
                        <span>Analyze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>

              {result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-1 text-sm">Detected Disease</h3>
                    <p className="text-lg font-semibold text-primary-600">{result.disease}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-600">Confidence:</span>
                      <span className="text-xs font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-1 text-sm">Treatment</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{result.treatment}</p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full btn-secondary py-2 text-sm"
                  >
                    Download Report
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Upload image to see results</p>
                </div>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Photography Tips</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-1 text-gray-600">
                <li>• Take photos in good lighting</li>
                <li>• Focus on affected plant parts</li>
                <li>• Avoid blurry images</li>
              </ul>
              <ul className="space-y-1 text-gray-600 font-tamil">
                <li>• நல்ல வெளிச்சத்தில் படம் எடுக்கவும்</li>
                <li>• பாதிக்கப்பட்ட பாகங்களில் கவனம் செலுத்துங்கள்</li>
                <li>• மங்கலான படங்களைத் தவிர்க்கவும்</li>
              </ul>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {history.length > 0 ? history.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-default group">
                  <div className="relative h-32 w-full">
                    <Image
                      src={item.imagePath}
                      alt={item.disease}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    <p className="font-semibold text-xs truncate text-gray-800">{item.disease}</p>
                    <p className="text-[10px] text-primary-600 font-medium">Confidence: {(item.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                  <p className="text-sm text-gray-400 mb-2">
                    {session ? 'No analyses yet' : 'Login to save your history'}
                  </p>
                  {!session && (
                    <Link href="/login" className="text-xs text-primary-600 font-bold hover:underline">
                      Sign In to start tracking →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}