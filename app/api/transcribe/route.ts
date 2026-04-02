import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { translate } from '@vitalets/google-translate-api'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const dynamic = 'force-dynamic'

function isTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File
    const language = formData.get('language') as string || 'en'

    if (!audio || audio.size === 0) {
      return NextResponse.json({ success: false, error: 'No audio' }, { status: 400 })
    }

    if (language === 'ta') {
      // Step 1: transcribe without forcing language — let Whisper detect it
      const raw = await groq.audio.transcriptions.create({
        file: audio,
        model: 'whisper-large-v3',
        response_format: 'text'
      }) as unknown as string

      let text = raw.trim()

      // Step 2: if result is not Tamil script, translate it to Tamil
      if (!isTamil(text)) {
        try {
          const result = await translate(text, { to: 'ta' })
          text = result.text
        } catch (e) {
          console.error('Translation error:', e)
        }
      }

      return NextResponse.json({ success: true, text })
    }

    // English — normal transcription
    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'text'
    }) as unknown as string

    return NextResponse.json({ success: true, text: transcription.trim() })

  } catch (error: any) {
    console.error('Transcribe error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
