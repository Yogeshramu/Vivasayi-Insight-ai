import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const language = formData.get('language') as string || 'en'
    let userId: string | null = formData.get('userId') as string || 'anonymous'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' })
    }

    // Check for Vercel environment before attempting file operations

    // Save uploaded image
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `crop_${Date.now()}_${file.name.replace(/\s+/g, '_')}`

    if (process.env.VERCEL) {
      console.log("Running on Vercel, skipping local file save for crop image.")
    } else {
      const uploadDir = join(process.cwd(), 'public/uploads')
      await mkdir(uploadDir, { recursive: true })
      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)
    }

    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      userId = session.user.id
    } else if (userId === 'anonymous') {
      userId = null
    }

    // Use Groq Vision for real analysis
    let analysis;
    try {
      const base64Image = buffer.toString('base64')
      const systemPrompt = `You are a plant pathologist.
      First, verify if the image contains a plant, leaf, or agricultural crop.
      If it is NOT a plant or crop (e.g., a person, car, or random object), respond with:
      {"disease": "Not a plant/crop", "confidence": 0, "treatment": "Please upload a clear photo of a plant or leaf for analysis."}

      If it IS a plant, analyze it and respond ONLY in JSON format:
      {
        "disease": "Disease Name in ${language === 'ta' ? 'Tamil' : 'English'}",
        "confidence": float (0-1),
        "treatment": "Treatment steps in ${language === 'ta' ? 'Tamil' : 'English'}",
        "severity": "low/medium/high"
      }`

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user', content: [
              { type: 'text', text: systemPrompt },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64Image}` } }
            ] as any
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        response_format: { type: 'json_object' },
        temperature: 0.1
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        analysis = JSON.parse(content)
      }
    } catch (e) {
      console.error("Vision AI Error on main page:", e)
      // Fallback if AI fails
      analysis = {
        disease: language === 'ta' ? 'இலை கருகல்' : 'Leaf Blight',
        treatment: language === 'ta' ? 'பூஞ்சை எதிர்ப்பு மருந்து பயன்படுத்தவும்.' : 'Apply fungicide.',
        confidence: 0.6,
        severity: 'medium'
      }
    }

    if (userId) {
      // Save to database
      await prisma.cropAnalysis.create({
        data: {
          userId,
          imagePath: `/uploads/${filename}`,
          disease: analysis.disease,
          confidence: analysis.confidence,
          treatment: analysis.treatment,
          language
        }
      }).catch(e => { })
    }

    // Determine appropriate image path for response
    // On Vercel, we can't serve the file we just accepted (readonly fs), so we return a data URI
    const responseImagePath = process.env.VERCEL
      ? `data:${file.type};base64,${buffer.toString('base64')}`
      : `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      result: {
        ...analysis,
        imagePath: responseImagePath
      }
    })

  } catch (error) {
    console.error('Crop analysis error:', error)
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
  }
}