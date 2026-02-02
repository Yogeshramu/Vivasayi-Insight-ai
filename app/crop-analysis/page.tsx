'use client'

import { useState, useRef, useEffect } from 'react'
import { CameraIcon, PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
  const [history, setHistory] = useState<any[]>([])

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
        if (session) fetchHistory()
      } else {
        throw new Error(data.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

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
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Crop Disease Analysis</h1>
        <p className="text-lg text-gray-600 font-tamil">பயிர் நோய் பகுப்பாய்வு</p>
        <p className="text-sm sm:text-base text-gray-500 mt-2">Upload a photo of your crop to detect diseases and get treatment recommendations</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Image Upload Section */}
            <div className="card p-5 sm:p-6">
              <h2 className="text-xl font-semibold mb-6 text-green-700">Upload Image</h2>

              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Crop preview"
                      width={400}
                      height={300}
                      className="w-full h-56 object-cover"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                        setResult(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all duration-300 group"
                  >
                    <PhotoIcon className="w-14 h-14 text-gray-300 mx-auto mb-4 group-hover:text-primary-400 group-hover:scale-110 transition-all" />
                    <p className="text-gray-600 font-medium mb-1">Select Crop Image</p>
                    <p className="text-xs text-gray-400 font-tamil">பயிர் படத்தைத் தேர்ந்தெடுக்கவும்</p>
                  </div>
                )}

                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />

                <div className="flex flex-col space-y-2 pt-2">
                  <button
                    onClick={analyzeImage}
                    disabled={!selectedImage || isAnalyzing}
                    className="btn-primary w-full flex items-center justify-center space-x-2 py-3.5 disabled:bg-gray-200 shadow-lg group"
                  >
                    {isAnalyzing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CameraIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    )}
                    <span className="font-bold">{isAnalyzing ? 'Analyzing Image...' : 'Detect Disease'}</span>
                  </button>
                  {!imagePreview && (
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary-600 font-bold hover:underline py-2">
                      or take a photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="card p-5 sm:p-6">
              <h2 className="text-xl font-semibold mb-6 text-green-700">Analysis Results</h2>

              {result ? (
                <div className="space-y-5">
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                    <h3 className="font-bold text-gray-900 mb-1 text-xs uppercase tracking-wider opacity-60">Probable Disease</h3>
                    <p className="text-xl font-black text-green-700">{result.disease}</p>
                    <div className="flex items-center mt-2 bg-white/50 w-fit px-2 py-0.5 rounded-full border border-green-200">
                      <span className="text-[10px] font-black text-green-800">Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider opacity-60">Treatment Steps</h3>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{result.treatment}</p>
                  </div>

                  <button onClick={() => window.print()} className="w-full btn-secondary py-2.5 text-xs font-bold border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
                    SAVE PDF REPORT
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
                  <CameraIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Upload image to see diagnosis</p>
                </div>
              )}
            </div>
          </div>

          {/* Photography Tips */}
          <div className="card p-5 sm:p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
            <h2 className="text-xl font-bold mb-4 flex items-center text-green-800">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] mr-2">!</span>
              Guidance for Best Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-bold text-green-700 underline uppercase tracking-widest">English</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Take photos in bright daylight</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Zoom in on affected spots/leaves</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Keep the camera still for focus</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-green-700 underline uppercase tracking-widest">Tamil</p>
                <ul className="space-y-1.5 text-sm font-tamil text-gray-700">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> பகல் வெளிச்சத்தில் படம் எடுக்கவும்</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> பாதிக்கப்பட்ட இலைகளை பெரிதாக்கவும்</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> கேமராவை அசையாமல் வைத்து எடுக்கவும்</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="card p-5 sm:p-6 h-fit shrink-0">
          <h2 className="text-xl font-bold mb-6 text-green-700">Past Diagnoses</h2>
          <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-1">
            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-default group bg-white">
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src={item.imagePath}
                    alt={item.disease}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <div className="bg-primary-50 text-primary-700 font-bold px-1.5 py-0.5 rounded text-[8px]">
                      {Math.round(item.confidence * 100)}% Match
                    </div>
                  </div>
                  <p className="font-bold text-sm text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                    {item.disease}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-sm text-gray-400 mb-3 px-4 leading-relaxed font-medium">
                  {session ? 'No history available yet.' : 'Please log in to keep track of your crop history and diagnoses.'}
                </p>
                {!session && (
                  <Link href="/login" className="text-xs text-primary-600 font-black hover:underline uppercase tracking-widest">
                    Log In Now →
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