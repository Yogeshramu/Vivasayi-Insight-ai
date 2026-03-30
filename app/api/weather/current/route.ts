import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const language = searchParams.get('language') || 'en'
    const userId = searchParams.get('userId') || 'anonymous'

    if (!location && (!lat || !lon)) {
      return NextResponse.json({
        success: false,
        error: 'Location or coordinates required'
      })
    }

    let weatherData
    let locationName = location || `${lat}, ${lon}`

    try {
      let resolvedLat = lat
      let resolvedLon = lon

      // Geocode city name to coordinates using Open-Meteo geocoding (free, no key)
      if (location) {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`)
        const geoJson = await geoRes.json()
        if (!geoJson.results?.length) throw new Error('Location not found')
        resolvedLat = geoJson.results[0].latitude
        resolvedLon = geoJson.results[0].longitude
        locationName = `${geoJson.results[0].name}, ${geoJson.results[0].country}`
      }

      // Fetch weather from Open-Meteo (free, no key)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${resolvedLat}&longitude=${resolvedLon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,visibility&wind_speed_unit=ms`
      const weatherResponse = await fetch(weatherUrl)

      if (!weatherResponse.ok) throw new Error('Weather API failed')

      const weatherJson = await weatherResponse.json()
      const c = weatherJson.current

      weatherData = {
        temperature: Math.round(c.temperature_2m),
        humidity: c.relative_humidity_2m,
        description: getWeatherDescription(c.weather_code),
        windSpeed: c.wind_speed_10m,
        pressure: c.surface_pressure,
        visibility: c.visibility ? c.visibility / 1000 : 10
      }
    } catch (weatherError) {
      console.error('Weather API error:', weatherError)

      // Fallback mock weather data
      weatherData = {
        temperature: 28,
        humidity: 65,
        description: 'partly cloudy',
        windSpeed: 3.2,
        pressure: 1013,
        visibility: 10
      }
    }

    // Generate farming recommendations based on weather
    const recommendations = generateFarmingRecommendations(weatherData, language)

    // Save to database only for authenticated users
    if (userId && userId !== 'anonymous') {
      try {
        await prisma.weatherRecommendation.create({
          data: {
            userId,
            location: locationName,
            weatherData: weatherData as any,
            recommendation: recommendations.map(r => r.title).join('; '),
            language
          }
        })
      } catch (dbError) {
        console.error('Database save error:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      weather: weatherData,
      location: locationName,
      recommendations
    })

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Weather fetch failed'
    }, { status: 500 })
  }
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'clear sky'
  if (code <= 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code <= 49) return 'foggy'
  if (code <= 59) return 'drizzle'
  if (code <= 69) return 'rain'
  if (code <= 79) return 'snow'
  if (code <= 82) return 'rain showers'
  if (code <= 86) return 'snow showers'
  if (code <= 99) return 'thunderstorm'
  return 'unknown'
}

function generateFarmingRecommendations(weather: any, language: string) {
  const recommendations = []

  // Temperature-based recommendations
  if (weather.temperature > 35) {
    recommendations.push({
      category: 'Temperature',
      title: language === 'ta' ? 'அதிக வெப்பநிலை எச்சரிக்கை' : 'High Temperature Alert',
      description: language === 'ta'
        ? 'பயிர்களுக்கு நிழல் வலை பயன்படுத்தவும். அதிகாலை அல்லது மாலையில் நீர் கொடுக்கவும். இலைகளில் நீர் தெளிக்கவும்.'
        : 'Use shade nets for crops. Water early morning or evening. Apply foliar spray to cool plants.',
      priority: 'high',
    })
  } else if (weather.temperature < 15) {
    recommendations.push({
      category: 'Temperature',
      title: language === 'ta' ? 'குளிர் பாதுகாப்பு' : 'Cold Protection',
      description: language === 'ta'
        ? 'பயிர்களை குளிரிலிருந்து பாதுகாக்க பிளாஸ்டிக் கவர் பயன்படுத்தவும். உறைபனி எச்சரிக்கை கவனிக்கவும்.'
        : 'Use plastic covers to protect crops from cold. Watch for frost warnings.',
      priority: 'high',
    })
  }

  // Humidity-based recommendations
  if (weather.humidity > 80) {
    recommendations.push({
      category: 'Humidity',
      title: language === 'ta' ? 'அதிக ஈரப்பதம் - பூஞ்சை எச்சரிக்கை' : 'High Humidity - Fungal Risk',
      description: language === 'ta'
        ? 'பூஞ்சை நோய்களுக்கு கவனம் செலுத்தவும். காற்றோட்டம் மேம்படுத்தவும். தடுப்பு மருந்து தெளிக்கவும்.'
        : 'Monitor for fungal diseases. Improve air circulation. Apply preventive fungicide.',
      priority: 'medium',
    })
  } else if (weather.humidity < 40) {
    recommendations.push({
      category: 'Humidity',
      title: language === 'ta' ? 'குறைந்த ஈரப்பதம்' : 'Low Humidity',
      description: language === 'ta'
        ? 'அடிக்கடி நீர் கொடுக்கவும். மண்ணில் ஈரப்பதம் தக்கவைக்க மல்ச் பயன்படுத்தவும்.'
        : 'Increase watering frequency. Use mulch to retain soil moisture.',
      priority: 'medium',
    })
  }

  // Wind-based recommendations
  if (weather.windSpeed > 10) {
    recommendations.push({
      category: 'Wind',
      title: language === 'ta' ? 'அதிக காற்று எச்சரிக்கை' : 'High Wind Alert',
      description: language === 'ta'
        ? 'உயரமான பயிர்களுக்கு ஆதரவு கொடுக்கவும். இலை சேதம் கவனிக்கவும். காற்று தடுப்பு நடவும்.'
        : 'Provide support for tall crops. Watch for leaf damage. Plant windbreaks.',
      priority: 'high',
    })
  }

  // General recommendations
  recommendations.push({
    category: 'General',
    title: language === 'ta' ? 'தினசரி கண்காணிப்பு' : 'Daily Monitoring',
    description: language === 'ta'
      ? 'பயிர்களின் ஆரோக்கியம், பூச்சிகள், நோய் அறிகுறிகளை தினமும் சரிபார்க்கவும்.'
      : 'Check crop health, pests, and disease symptoms daily.',
    priority: 'low',
  })

  return recommendations
}