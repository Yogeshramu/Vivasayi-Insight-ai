import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { translate } from '@vitalets/google-translate-api'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function isTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text)
}

async function getWeatherDataForPrompt(location: string) {
  try {
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

const AGRICULTURAL_PROMPT = `You are a highly capable AI Agricultural Advisor. 

CRITICAL INSTRUCTIONS:
1. If an [IMAGE ANALYSIS RESULT] is provided, YOU MUST ACKNOWLEDGE IT AS TRUTH. 
2. DO NOT say "I don't have the image". The system has already analyzed it for you.
3. Your job is to explain the FOUND disease/condition and provide a treatment plan.
4. Keep advice actionable, farmer-friendly, and scientifically sound.
5. If no weather is provided, give general advice. If weather is provided, use it contextually.`

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let message = '', language = '', userId: string | null = '', userLoc = '', file: File | null = null, history = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      message = formData.get('message') as string || ''
      language = formData.get('language') as string || ''
      userId = formData.get('userId') as string || ''
      userLoc = formData.get('location') as string || ''
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
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
        const uploadDir = join(process.cwd(), 'public/uploads')
        await mkdir(uploadDir, { recursive: true })
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)
        savedImagePath = `/uploads/${filename}`
      } catch (e) {
        console.error("Image saving error:", e)
      }
    }

    const detectedLanguage = language || (isTamil(message) ? 'ta' : 'en')
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
        { type: "text", text: `${dynamicPrompt}\nFarmer Query: ${processedMessage || "Please analyze this crop photo."}` }
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

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: AGRICULTURAL_PROMPT },
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
      response = "I processed the data but encountered an AI error. Please try again."
    }

    if (detectedLanguage === 'ta') {
      try {
        const transRes = await translate(response, { from: 'en', to: 'ta' })
        response = transRes.text
      } catch (e) { }
    }

    if (userId) {
      await prisma.chatSession.create({
        data: {
          userId,
          messages: [
            { role: 'user', content: message || "Image analysis request", timestamp: new Date(), ...(savedImagePath && { image: savedImagePath }) },
            { role: 'assistant', content: response, timestamp: new Date() }
          ],
          language: detectedLanguage
        }
      }).catch(e => { })
    }

    return NextResponse.json({ success: true, response, detectedLanguage })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 })
  }
}