import Link from 'next/link'
import {
  ChatBubbleLeftRightIcon,
  CameraIcon,
  BeakerIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const features = [
    {
      title: 'AI Chatbot',
      titleTamil: 'AI உதவியாளர்',
      description: 'Get farming advice in Tamil or English',
      descriptionTamil: 'தமிழ் அல்லது ஆங்கிலத்தில் விவசாய ஆலோசனை பெறுங்கள்',
      href: '/chat',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Crop Analysis',
      titleTamil: 'பயிர் பகுப்பாய்வு',
      description: 'Upload crop images for disease detection',
      descriptionTamil: 'நோய் கண்டறிதலுக்காக பயிர் படங்களை பதிவேற்றவும்',
      href: '/crop-analysis',
      icon: CameraIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Soil Prediction',
      titleTamil: 'மண் கணிப்பு',
      description: 'Predict soil moisture without sensors',
      descriptionTamil: 'சென்சார்கள் இல்லாமல் மண் ஈரப்பதத்தை கணிக்கவும்',
      href: '/soil-prediction',
      icon: BeakerIcon,
      color: 'bg-amber-500'
    },
    {
      title: 'Weather Tips',
      titleTamil: 'வானிலை குறிப்புகள்',
      description: 'Weather-based farming recommendations',
      descriptionTamil: 'வானிலை அடிப்படையிலான விவசாய பரிந்துரைகள்',
      href: '/weather',
      icon: CloudIcon,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-10 px-2 lg:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Farmer AI Support System
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-2">
          விவசாயிகளுக்கான AI உதவி அமைப்பு
        </p>
        <p className="text-sm sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Get instant crop disease diagnosis, agricultural advice, soil predictions,
          and weather recommendations - all powered by AI
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="card hover:shadow-xl transition-shadow group cursor-pointer p-5 sm:p-6"
            >
              <div className={`${feature.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 font-tamil">
                {feature.titleTamil}
              </h4>
              <p className="text-gray-600 text-sm mb-1 leading-snug">
                {feature.description}
              </p>
              <p className="text-gray-500 text-xs font-tamil leading-snug">
                {feature.descriptionTamil}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">38+</div>
          <div className="text-sm sm:text-base text-gray-600">Crop Diseases</div>
          <div className="text-xs text-gray-500 font-tamil mt-1">38+ பயிர் நோய்கள்</div>
        </div>
        <div className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">2</div>
          <div className="text-sm sm:text-base text-gray-600">Languages</div>
          <div className="text-xs text-gray-500 font-tamil mt-1">2 மொழிகள்</div>
        </div>
        <div className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">24/7</div>
          <div className="text-sm sm:text-base text-gray-600">AI Support</div>
          <div className="text-xs text-gray-500 font-tamil mt-1">24/7 AI உதவியாளர்</div>
        </div>
      </div>
    </div>
  )
}