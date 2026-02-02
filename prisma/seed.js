const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      name: 'Raman Kumar',
      phone: '+91-9876543210',
      language: 'ta',
      location: 'Chennai, Tamil Nadu'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      phone: '+91-9876543211',
      language: 'en',
      location: 'Coimbatore, Tamil Nadu'
    }
  })

  // Create sample chat sessions
  await prisma.chatSession.create({
    data: {
      userId: user1.id,
      messages: [
        {
          role: 'user',
          content: 'என் தக்காளி செடியில் இலைகள் மஞ்சளாக மாறுகின்றன',
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: 'இது நீர் அதிகமாக கொடுத்ததால் அல்லது நைட்ரஜன் குறைபாட்டால் இருக்கலாம். மண்ணின் ஈரப்பதத்தை சரிபார்த்து, சரியான அளவில் நீர் கொடுக்கவும்.',
          timestamp: new Date()
        }
      ],
      language: 'ta'
    }
  })

  // Create sample crop analyses
  await prisma.cropAnalysis.create({
    data: {
      userId: user1.id,
      imagePath: '/uploads/sample_tomato.jpg',
      disease: 'தக்காளி முன்கூட்டிய வாடல்',
      confidence: 0.87,
      treatment: 'பூஞ்சை எதிர்ப்பு மருந்து தெளிக்கவும். பாதிக்கப்பட்ட இலைகளை அகற்றவும்.',
      language: 'ta'
    }
  })

  // Create sample soil predictions
  await prisma.soilPrediction.create({
    data: {
      userId: user2.id,
      temperature: 28.5,
      humidity: 65.0,
      rainfall: 12.0,
      cropType: 'rice',
      season: 'monsoon',
      predictedMoisture: 72.0,
      recommendation: 'Soil moisture is adequate. Reduce watering frequency and ensure proper drainage.',
      language: 'en'
    }
  })

  // Create sample weather recommendations
  await prisma.weatherRecommendation.create({
    data: {
      userId: user1.id,
      location: 'Chennai, Tamil Nadu',
      weatherData: {
        temperature: 32,
        humidity: 78,
        description: 'partly cloudy',
        windSpeed: 4.2,
        pressure: 1012
      },
      recommendation: 'High humidity detected. Monitor crops for fungal diseases. Apply preventive fungicide spray.',
      language: 'en'
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })