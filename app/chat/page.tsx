'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, LanguageIcon, MapPinIcon, PhotoIcon, XMarkIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  language?: string
  image?: string
}

export default function ChatPage() {
  // Use null for initial state to avoid hydration mismatch with Dates
  const [messages, setMessages] = useState<Message[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ta'>('en')
  const [location, setLocation] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const isListeningRef = useRef(false)
  const baseTextRef = useRef('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const playSound = (type: 'start' | 'stop') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(type === 'start' ? 880 : 440, ctx.currentTime)

      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch (e) {
      console.error('Audio error:', e)
    }
  }

  const startRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = 'ta-IN'
        recognitionRef.current.start()
      } catch (e) {
        // Recognition might already be running
      }
    }
  }

  // Initialize messages only on client side
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI farming assistant. You can now upload crop photos directly here for instant disease analysis. நான் உங்கள் AI விவசாய உதவியாளர். நேரடியான பயிர் நோய் பகுப்பாய்விற்கு புகைப்படங்களை இங்கே பதிவேற்றலாம்.',
        timestamp: new Date()
      }
    ])
    setHasLoaded(true)

    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started')
      }

      recognitionRef.current.onresult = (event: any) => {
        let sessionTranscript = ''

        for (let i = 0; i < event.results.length; ++i) {
          sessionTranscript += event.results[i][0].transcript
        }

        const fullText = baseTextRef.current + sessionTranscript
        if (fullText) {
          console.log('Continuous speech result:', fullText)
          setInput(fullText)
        }
      }

      recognitionRef.current.onend = () => {
        console.log('Speech recognition session ended')
        // Save current input as base for the next session to ensure continuity
        baseTextRef.current = input

        if (isListeningRef.current) {
          console.log('Continuous mode: Restarting...')
          startRecognition()
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'network') {
          alert('Speech Recognition Network Error: This browser requires an active internet connection to process speech.')
          setIsListening(false)
          isListeningRef.current = false
        }
        // For other errors like 'no-speech', we just let onend handle the restart check
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      isListeningRef.current = false
      setIsListening(false)
      recognitionRef.current?.stop()
      baseTextRef.current = ''
      playSound('stop')
    } else {
      baseTextRef.current = input // Start with whatever is already in the box
      isListeningRef.current = true
      setIsListening(true)
      playSound('start')
      startRecognition()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (hasLoaded) {
      scrollToBottom()
    }
  }, [messages, hasLoaded])

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=97676a00fa2d8c10d861b97d619d271b`)
          const data = await res.json()
          if (data.name) {
            setLocation(data.name)
          }
        } catch (e) {
          console.error(e)
        }
      })
    }
  }

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return

    // Note: We no longer stop listening here to keep it continuous as requested

    const userMessage: Message = {
      role: 'user',
      content: input || (selectedImage ? 'Analyzing this crop photo...' : ''),
      timestamp: new Date(),
      language,
      image: imagePreview || undefined
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    const currentImage = selectedImage

    setInput('')
    baseTextRef.current = ''
    setSelectedImage(null)
    setImagePreview(null)
    setIsLoading(true)

    // If listening, restart recognition to clear the internal buffer for the NEXT message
    if (isListening) {
      recognitionRef.current?.stop()
      // Note: isListeningRef remains true, so onend will automatically restart it fresh
    }

    try {
      const formData = new FormData()
      formData.append('message', currentInput)
      formData.append('language', language)
      formData.append('location', location)
      formData.append('history', JSON.stringify(messages.slice(-5)))
      if (currentImage) {
        formData.append('image', currentImage)
      }

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          language: data.detectedLanguage || language
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: language === 'ta' ? 'மன்னிக்கவும், பிழை ஏற்பட்டது.' : 'Sorry, an error occurred during analysis.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      fetchHistory()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const [history, setHistory] = useState<any[]>([])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat/history')
      const data = await response.json()
      if (data.success) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('History fetch error:', error)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // If not loaded on client yet, show nothing or a loader to prevent hydration mismatch
  if (!hasLoaded) return null

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-4">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
        {/* History Sidebar */}
        <div className="hidden lg:block space-y-4">
          <div className="card p-4 h-[calc(100vh-160px)] flex flex-col sticky top-20">
            <h2 className="font-semibold mb-3 flex items-center text-green-700">
              <LanguageIcon className="w-5 h-5 mr-2" />
              Recent History
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar text-sm">
              {history.length > 0 ? history.map((session) => (
                <div key={session.id} className="p-2 hover:bg-green-50 rounded-lg cursor-pointer border-b border-gray-50 transition-colors">
                  <p className="text-[10px] text-gray-400 mb-1">{new Date(session.createdAt).toLocaleDateString()}</p>
                  <p className="truncate font-medium text-gray-700">{session.messages[0]?.content || "Image Analysis"}</p>
                </div>
              )) : <p className="text-sm text-gray-400 text-center py-10">No chats yet</p>}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="card h-[calc(100vh-140px)] sm:h-[650px] flex flex-col shadow-2xl border-green-100 overflow-hidden p-0 rounded-2xl sm:rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white shrink-0">
              <div className="flex items-center space-x-2">
                <div className="bg-white text-green-600 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">AI</div>
                <div>
                  <h1 className="text-sm sm:text-lg font-bold truncate max-w-[120px] sm:max-w-none">
                    Farmer Advisor
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <button
                  onClick={fetchUserLocation}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] sm:text-xs transition-all ${location ? 'bg-white/20 border border-white/30' : 'bg-yellow-400 text-black font-bold animate-pulse'}`}
                >
                  <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{location || 'Set GPS'}</span>
                  {!location && <span className="xs:hidden">GPS</span>}
                </button>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                  className="px-2 py-1 bg-white/20 border border-white/30 rounded-full text-[10px] sm:text-xs hover:bg-white/30 transition-colors font-bold uppercase"
                >
                  {language === 'en' ? 'தமிழ்' : 'English'}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50 custom-scrollbar">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] space-y-1`}>
                    <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${message.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-none ml-auto'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                      {message.image && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                          <Image src={message.image} alt="Uploaded crop" width={200} height={150} className="w-full h-auto object-cover max-h-[200px]" />
                        </div>
                      )}
                      <div className={`text-sm sm:text-base leading-relaxed markdown-content ${message.role === 'user' ? 'text-white' : 'text-gray-800'} ${message.language === 'ta' ? 'font-tamil' : ''}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <p className={`text-[8px] sm:text-[9px] mt-1 opacity-60 text-right`} suppressHydrationWarning>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-green-100 rounded-2xl px-4 py-2 shadow-sm flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-2 sm:p-4 border-t bg-white relative shrink-0">
              {imagePreview && (
                <div className="absolute bottom-full left-2 sm:left-4 mb-2 p-2 bg-white border border-green-200 rounded-xl shadow-xl flex items-center space-x-2 z-10">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                  <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="p-1 bg-red-50 text-red-500 rounded-full hover:bg-red-100">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex space-x-2 items-center sm:items-end">
                <div className="flex space-x-0.5 sm:space-x-1 items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                  <button onClick={() => fileInputRef.current?.click()} className="p-1.5 sm:p-2 text-gray-500 hover:text-green-600 transition-colors">
                    <PhotoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={toggleListening}
                    className={`p-1.5 sm:p-2 transition-all rounded-full relative ${isListening ? 'text-red-600 bg-red-100' : 'text-gray-500 hover:text-green-600'}`}
                  >
                    {isListening && (
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25 font-bold"></span>
                    )}
                    <MicrophoneIcon className={`w-5 h-5 sm:w-6 h-6 sm:h-6 relative z-10 ${isListening ? 'scale-110' : ''}`} />
                  </button>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isListening
                      ? "தமிழில்..."
                      : (language === 'en' ? "Type advice..." : "கேளுங்கள்...")
                  }
                  className={`flex-1 border border-gray-100 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3.5 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none bg-gray-50 text-sm sm:text-base ${language === 'ta' ? 'font-tamil' : ''}`}
                  rows={1}
                  disabled={isLoading}
                />

                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

                <button onClick={sendMessage} disabled={(!input.trim() && !selectedImage) || isLoading} className="bg-green-600 text-white p-3 rounded-2xl hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:bg-gray-200 shrink-0">
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}