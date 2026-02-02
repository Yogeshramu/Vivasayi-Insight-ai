import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { temperature, humidity, rainfall, cropType, season, location, language } = await request.json()
    const session = await getServerSession(authOptions)

    // Determine moisture level using a dynamic model (simulated or LLM)
    const temp = parseFloat(temperature)
    const hum = parseFloat(humidity)
    const rain = parseFloat(rainfall) || 0

    // Core formula for moisture estimation
    let moistureLevel = Math.round(Math.max(0, Math.min(100,
      (hum * 0.6) + (rain * 0.3) + ((35 - temp) * 0.1)
    )))

    let prediction;
    try {
      // Use Groq for DYNAMIC recommendations
      const systemPrompt = `You are a soil expert. Provide a concise agricultural recommendation for a farmer.
      Current Conditions:
      - Temperature: ${temp}°C
      - Humidity: ${hum}%
      - Rainfall: ${rain}mm
      - Crop: ${cropType}
      - Estimated Soil Moisture: ${moistureLevel}%
      
      Respond only in JSON:
      {
        "recommendation": "Recommendation in ${language === 'ta' ? 'Tamil' : 'English'}",
        "irrigation_needed": boolean,
        "next_check": "Timeframe in ${language === 'ta' ? 'Tamil' : 'English'}"
      }`

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: systemPrompt }],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
        temperature: 0.1
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        const aiData = JSON.parse(content)
        prediction = {
          moisture_level: moistureLevel,
          ...aiData
        }
      }
    } catch (e) {
      console.error("Soil AI Error:", e)
      prediction = {
        moisture_level: moistureLevel,
        recommendation: language === 'ta' ? 'மண் ஈரப்பதத்தை கண்காணிக்கவும்.' : 'Monitor soil moisture levels.',
        irrigation_needed: moistureLevel < 40,
        next_check: language === 'ta' ? '24 மணி நேரத்தில்' : 'In 24 hours'
      }
    }

    // Save prediction if user is logged in
    if (session?.user?.id) {
      try {
        await prisma.soilPrediction.create({
          data: {
            userId: session.user.id,
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
            rainfall: parseFloat(rainfall) || 0,
            cropType,
            season,
            predictedMoisture: prediction.moisture_level,
            recommendation: prediction.recommendation,
            language: language || 'en'
          }
        })
      } catch (dbError) {
        console.error('Database save error:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      prediction: {
        moistureLevel: prediction.moisture_level,
        irrigationNeeded: prediction.irrigation_needed,
        recommendation: prediction.recommendation,
        nextCheck: prediction.next_check
      }
    })

  } catch (error: any) {
    console.error('Chat history fetch error DETAILS:', {
      message: error.message,
      stack: error.stack,
      env: process.env.NODE_ENV
    })
    return NextResponse.json({
      success: false,
      error: `Failed to fetch history: ${error.message}`
    }, { status: 500 })
  }
}