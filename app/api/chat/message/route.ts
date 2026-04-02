import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { translate } from '@vitalets/google-translate-api'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const dynamic = 'force-dynamic'

function isTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text)
}

async function getWeatherDataForPrompt(location: string) {
  try {
    console.log(`Fetching weather data for location: ${location}`);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPENWEATHER_API_KEY}&units=metric&q=${encodeURIComponent(location)}`
    const response = await fetch(weatherUrl)
    if (!response.ok) return null
    const data = await response.json()
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      location: data.name
    }
  } catch (e) { return null }
}

const AGRICULTURAL_PROMPT_EN = `You are a highly capable AI Agricultural Advisor. 

CRITICAL INSTRUCTIONS:
1. If an [IMAGE ANALYSIS RESULT] is provided, YOU MUST ACKNOWLEDGE IT AS TRUTH. 
2. DO NOT say "I don't have the image". The system has already analyzed it for you.
3. Your job is to explain the FOUND disease/condition and provide a treatment plan.
4. Keep advice actionable, farmer-friendly, and scientifically sound.
5. If no weather is provided, give general advice. If weather is provided, use it contextually.`

const AGRICULTURAL_PROMPT_TA = `நீங்கள் ஒரு திறமையான AI விவசாய ஆலோசகர். 

முக்கியமான வழிமுறைகள்:
1. படம் பதிவேற்றப்பட்டிருந்தால், அதை பகுப்பாய்வு செய்து நோய் அல்லது நிலையை விளக்கவும்.
2. "என்னிடம் படம் இல்லை" என்று சொல்லாதீர்கள். கணினி ஏற்கனவே அதை பகுப்பாய்வு செய்துள்ளது.
3. நோய்/நிலையை விளக்கி சிகிச்சை திட்டம் வழங்கவும்.
4. அனைத்து பதில்களையும் தமிழிலேயே தரவும் (RESPOND ONLY IN TAMIL).
5. விவசாயிக்கு எளிதில் புரியும் வகையில் நடைமுறை ஆலோசனை தரவும்.`

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let message = '', language = '', userId: string | null = '', userLoc = '', file: File | null = null, history = [], sessionId: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      message = formData.get('message') as string || ''
      language = formData.get('language') as string || ''
      userId = formData.get('userId') as string || ''
      userLoc = formData.get('location') as string || ''
      sessionId = formData.get('sessionId') as string || null
      file = formData.get('image') as File
      try {
        const h = formData.get('history') as string
        if (h) history = JSON.parse(h)
      } catch (e) { }
    } else {
      const json = await request.json()
      message = json.message
      language = json.language
      userId = json.userId
      userLoc = json.location
      history = json.history || []
    }

    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      userId = session.user.id
    } else {
      userId = null
    }

    let imageAnalysisResult = ""
    let savedImagePath = ""

    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        if (process.env.VERCEL) {
          console.log("Running on Vercel, skipping local file save for chat image.");
          savedImagePath = ""; // On Vercel, we rely on the base64 data for AI, and don't store locally
        } else {
          const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
          const uploadDir = join(process.cwd(), 'public/uploads')
          await mkdir(uploadDir, { recursive: true })
          const filepath = join(uploadDir, filename)
          await writeFile(filepath, buffer)
          savedImagePath = `/uploads/${filename}`
        }
      } catch (e) {
        console.error("Image saving error:", e)
      }
    }

    const detectedLanguage = isTamil(message) ? 'ta' : (language || 'en')
    let processedMessage = message

    if (detectedLanguage === 'ta' && message) {
      try {
        const trans = await translate(message, { from: 'ta', to: 'en' })
        processedMessage = trans.text
      } catch (e) { }
    }

    let dynamicPrompt = ""
    const locMatch = processedMessage?.match(/in ([a-zA-Z\s,]+)/i)
    const locationToFetch = userLoc || (locMatch ? locMatch[1].trim() : null)
    if (locationToFetch) {
      const weather = await getWeatherDataForPrompt(locationToFetch)
      if (weather) {
        dynamicPrompt += `[CONTEXT: Location: ${weather.location}, Weather: ${weather.temp}°C, ${weather.description}, Humidity: ${weather.humidity}%]\n`
      }
    }

    const soil = userId ? await prisma.soilPrediction.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }) : null
    if (soil) dynamicPrompt += `[CONTEXT: Last Soil Check: ${soil.predictedMoisture}%]\n`

    let response: string
    try {
      const userContent: any[] = [
        { type: "text", text: `${dynamicPrompt}\n${detectedLanguage === 'ta' ? 'விவசாயி கேள்வி:' : 'Farmer Query:'} ${detectedLanguage === 'ta' ? (message || 'இந்த பயிர் படத்தை பகுப்பாய்வு செய்யவும்.') : (processedMessage || 'Please analyze this crop photo.')}` }
      ]

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const base64Image = Buffer.from(bytes).toString('base64')
        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:${file.type};base64,${base64Image}`
          }
        })
      }

      const systemPrompt = detectedLanguage === 'ta' ? AGRICULTURAL_PROMPT_TA : AGRICULTURAL_PROMPT_EN

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...history?.slice(-3).map((m: any) => ({ role: m.role, content: m.content })) || [],
          { role: 'user', content: userContent }
        ],
        model: file && file.size > 0 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens: 1024
      })
      response = completion.choices[0]?.message?.content || 'Service error.'
    } catch (e) {
      console.error("Groq Vision Error:", e)
      response = detectedLanguage === 'ta'
        ? 'தரவை செயலாக்கினேன், ஆனால் AI பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
        : 'I processed the data but encountered an AI error. Please try again.'
    }

    if (detectedLanguage === 'ta') {
      // Only translate if response appears to still be in English (fallback)
      if (!/[\u0B80-\u0BFF]/.test(response)) {
        try {
          const transRes = await translate(response, { from: 'en', to: 'ta' })
          response = transRes.text
        } catch (e) { }
      }
    }

    if (userId) {
      const newMessages = [
        { role: 'user', content: message || 'Image analysis request', timestamp: new Date(), ...(savedImagePath && { image: savedImagePath }) },
        { role: 'assistant', content: response, timestamp: new Date() }
      ]

      if (sessionId) {
        const existing = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } })
        if (existing) {
          const updatedMessages = [...(existing.messages as any[]), ...newMessages]
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { messages: updatedMessages }
          }).catch(() => {})
          return NextResponse.json({ success: true, response, detectedLanguage, sessionId })
        }
      }

      const created = await prisma.chatSession.create({
        data: { userId, messages: newMessages, language: detectedLanguage }
      }).catch(() => null)
      return NextResponse.json({ success: true, response, detectedLanguage, sessionId: created?.id ?? null })
    }

    return NextResponse.json({ success: true, response, detectedLanguage })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Chat API is active' })
}