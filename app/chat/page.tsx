'use client'

import { useState, useRef, useEffect } from 'react'
import {
  PaperAirplaneIcon, PhotoIcon, XMarkIcon, MicrophoneIcon,
  MapPinIcon, PlusIcon, ChatBubbleLeftRightIcon,
  PencilSquareIcon, Bars3BottomLeftIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSession } from 'next-auth/react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  image?: string
}

interface ChatSession {
  id: string
  messages: any[]
  createdAt: string
}

const makeWelcome = (): Message => ({
  role: 'assistant',
  content: "Hello! I'm your AI farming assistant. Upload leaf photos for instant disease analysis.\nநான் உங்கள் AI விவசாய உதவியாளர். இலை நோய் பகுப்பாய்விற்கு புகைப்படங்களை பதிவேற்றலாம்.",
  timestamp: new Date()
})

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([makeWelcome()])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ta'>('en')
  const [location, setLocation] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [pendingAudio, setPendingAudio] = useState<{ blob: Blob; mimeType: string } | null>(null)
  const [history, setHistory] = useState<ChatSession[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const currentSessionIdRef = useRef<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const skipScrollRef = useRef(false)

  useEffect(() => {
    if (skipScrollRef.current) { skipScrollRef.current = false; return }
    const container = messagesContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages])

  useEffect(() => { if (session) fetchHistory() }, [session])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/chat/history')
      const data = await res.json()
      if (data.success) setHistory(data.history)
    } catch {}
  }

  const startNewChat = () => {
    setMessages([makeWelcome()])
    setActiveChatId(null)
    currentSessionIdRef.current = null
    setInput('')
    setSelectedImage(null)
    setImagePreview(null)
  }

  const loadChat = (chat: ChatSession) => {
    skipScrollRef.current = true
    setMessages(chat.messages.map((m: any) => ({
      role: m.role, content: m.content,
      timestamp: new Date(m.timestamp), image: m.image
    })))
    setActiveChatId(chat.id)
    currentSessionIdRef.current = chat.id
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const fetchLocation = () => {
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      setLocation(`${coords.latitude.toFixed(1)}, ${coords.longitude.toFixed(1)}`)
    })
  }

  const toggleListening = async () => {
    if (isListening) {
      // Stop recording — mediaRecorder.stop() triggers onstop which sends to Whisper
      mediaRecorderRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, { mimeType })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        if (audioBlob.size < 1000) return
        setPendingAudio({ blob: audioBlob, mimeType })
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsListening(true)
    } catch (err) {
      console.error('Mic error:', err)
      alert('Microphone access denied. Please allow mic access and try again.')
    }
  }

  const transcribePending = async () => {
    if (!pendingAudio) return
    setIsTranscribing(true)
    try {
      const fd = new FormData()
      fd.append('audio', pendingAudio.blob, `recording.${pendingAudio.mimeType.includes('webm') ? 'webm' : 'mp4'}`)
      fd.append('language', language)
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success && data.text) setInput(prev => (prev ? prev + ' ' : '') + data.text.trim())
    } catch (err) {
      console.error('Transcription error:', err)
    } finally {
      setIsTranscribing(false)
      setPendingAudio(null)
    }
  }

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return
    const userMsg: Message = {
      role: 'user', content: input || 'Analyzing this leaf photo...',
      timestamp: new Date(), image: imagePreview || undefined
    }
    setMessages(prev => [...prev, userMsg])
    const curInput = input, curImage = selectedImage
    setInput('')
    setSelectedImage(null); setImagePreview(null)
    setIsLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const formData = new FormData()
      formData.append('message', curInput)
      formData.append('language', language)
      formData.append('location', location)
      formData.append('history', JSON.stringify(messages.slice(-5)))
      if (curImage) formData.append('image', curImage)
      if (currentSessionIdRef.current) formData.append('sessionId', currentSessionIdRef.current)

      const res = await fetch('/api/chat/message', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        if (data.sessionId) {
          currentSessionIdRef.current = data.sessionId
          setActiveChatId(data.sessionId)
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }])
        if (session) fetchHistory()
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, an error occurred. Please try again.', timestamp: new Date() }])
    } finally { setIsLoading(false) }
  }

  const getChatTitle = (chat: ChatSession) => {
    const first = chat.messages.find((m: any) => m.role === 'user')
    const raw = first?.content?.trim()
    if (!raw) return 'New conversation'
    const cleaned = raw.replace(/[\r\n]+/g, ' ').trim()
    return cleaned.length > 36 ? cleaned.slice(0, 36) + '…' : cleaned
  }

  const getChatMeta = (chat: ChatSession) => {
    const userMsgs = chat.messages.filter((m: any) => m.role === 'user').length
    const hasImage = chat.messages.some((m: any) => m.image)
    return { userMsgs, hasImage }
  }

  const formatDate = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return new Date(dateStr).toLocaleDateString()
  }

  const userName = session?.user?.name || 'Guest'
  const userInitial = userName.charAt(0).toUpperCase()

  const groupedHistory = ['Today', 'Yesterday', 'Previous'].map(group => ({
    label: group,
    chats: history.filter(c => {
      const label = formatDate(c.createdAt)
      if (group === 'Previous') return label !== 'Today' && label !== 'Yesterday'
      return label === group
    })
  })).filter(g => g.chats.length > 0)

  return (
    <div className="flex overflow-hidden -mx-4 -mt-4 md:mx-auto md:mt-0 md:mb-0 md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 md:max-w-5xl" style={{ height: 'calc(100dvh - 64px)', maxHeight: '680px' }}>

      {/* ── SIDEBAR ── */}
      <aside className={`
        flex-col bg-white border-r border-gray-200 shrink-0 transition-all duration-300 overflow-hidden
        fixed inset-y-0 left-0 z-40 w-64
        md:relative md:z-auto md:inset-auto
        ${sidebarOpen ? 'flex translate-x-0 md:w-60' : 'hidden md:flex md:w-0'}
      `}>
        <div className="flex items-center justify-between px-3 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">Chats</span>
          </div>
          <button onClick={startNewChat} title="New chat"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-primary-600 hover:bg-primary-50 transition-colors">
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          {!session ? (
            <div className="mt-6 mx-1 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-semibold text-gray-800 mb-1">Save your chat history</p>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">Log in to save conversations and pick up where you left off.</p>
              <a href="/login" className="block w-full text-center py-1.5 px-3 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors">
                Log in
              </a>
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-600 text-center mt-8">No conversations yet</p>
          ) : (
            groupedHistory.map(({ label, chats }) => (
              <div key={label} className="mb-4">
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest px-2 mb-1">{label}</p>
                {chats.map(chat => {
                  const { userMsgs, hasImage } = getChatMeta(chat)
                  const isActive = activeChatId === chat.id
                  return (
                    <button key={chat.id} onClick={() => loadChat(chat)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors group ${isActive ? 'bg-primary-50' : 'hover:bg-gray-100'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-medium truncate leading-snug ${isActive ? 'text-primary-700' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {getChatTitle(chat)}
                        </p>
                        {hasImage && <span className="shrink-0 text-[9px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full font-medium">📷</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">{formatDate(chat.createdAt)}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{userMsgs} {userMsgs === 1 ? 'msg' : 'msgs'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-3 py-3 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-primary-50">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-800 font-semibold truncate">{userName}</p>
              <p className="text-[10px] text-primary-500 font-medium">{session ? '● Online' : 'Guest'}</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">

        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 shrink-0">
          <button onClick={() => setSidebarOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
            <Bars3BottomLeftIcon className="w-5 h-5" />
          </button>
          <p className="text-sm font-semibold text-gray-800">AgriPulse</p>
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={fetchLocation}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${location ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:bg-gray-100'}`}>
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[70px] truncate">{location || 'Location'}</span>
            </button>
            <button onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')}
              className="px-2 py-1 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors">
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            <button onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors">
              <PlusIcon className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%]">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                      {msg.image && (
                        <div className="mb-2 rounded-xl overflow-hidden">
                          <Image src={msg.image} alt="Uploaded" width={200} height={150} className="w-full h-auto max-h-44 object-cover" />
                        </div>
                      )}
                      <span className={language === 'ta' ? 'font-tamil' : ''}>{msg.content}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 pr-1 text-right" suppressHydrationWarning>
                      {userName} · {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                        <span className="text-white text-[9px] font-black">AI</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">AgriPulse</span>
                    </div>
                    <div className={`prose prose-sm max-w-none text-gray-800 pl-8 markdown-content ${language === 'ta' ? 'font-tamil' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 pl-8" suppressHydrationWarning>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-[9px] font-black">AI</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">AgriPulse</span>
                </div>
                <div className="pl-8 flex gap-1 items-center h-6">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 shrink-0">
          <div className="max-w-2xl mx-auto">
            {imagePreview && (
              <div className="flex items-center gap-2 mb-2 p-1.5 bg-gray-50 rounded-xl border border-gray-200 w-fit">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
                <button onClick={() => { setSelectedImage(null); setImagePreview(null) }}
                  className="p-0.5 text-gray-400 hover:text-red-500">
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2 bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all">
              <button onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mb-0.5">
                <PhotoIcon className="w-5 h-5" />
              </button>

              {pendingAudio ? (
                <button onClick={transcribePending} disabled={isTranscribing}
                  className="relative shrink-0 mb-0.5 text-green-600 hover:text-green-700 transition-colors"
                  title="Send for transcription">
                  {isTranscribing && <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />}
                  <PaperAirplaneIcon className="w-5 h-5 relative z-10" />
                </button>
              ) : (
                <button onClick={toggleListening} disabled={isTranscribing}
                  className={`relative shrink-0 mb-0.5 transition-colors ${isListening ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                  title={isListening ? 'Stop recording' : 'Start recording'}>
                  {isListening && <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />}
                  <MicrophoneIcon className="w-5 h-5 relative z-10" />
                </button>
              )}

              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = `${Math.min(t.scrollHeight, 120)}px`
                }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={isListening ? '🎙️ Recording... click mic to stop' : isTranscribing ? 'Transcribing...' : pendingAudio ? '✅ Recording ready — click ▶ to transcribe' : language === 'en' ? 'Ask anything...' : 'கேளுங்கள்...'}
                className={`flex-1 bg-transparent outline-none resize-none text-sm text-gray-800 placeholder-gray-400 py-0.5 max-h-28 ${language === 'ta' ? 'font-tamil' : ''}`}
                rows={1}
                disabled={isLoading}
              />

              <button onClick={sendMessage}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-gray-700 text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed shrink-0">
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">AgriPulse AI may make mistakes · Verify critical advice</p>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={e => {
        const f = e.target.files?.[0]; if (!f) return
        setSelectedImage(f)
        const reader = new FileReader()
        reader.onload = ev => setImagePreview(ev.target?.result as string)
        reader.readAsDataURL(f)
      }} accept="image/*" className="hidden" />
    </div>
  )
}
