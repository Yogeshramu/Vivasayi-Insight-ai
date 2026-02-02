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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Farmer AI Support System
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          விவசாயிகளுக்கான AI உதவி அமைப்பு
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Get instant crop disease diagnosis, agricultural advice, soil predictions, 
          and weather recommendations - all powered by AI
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="card hover:shadow-xl transition-shadow group cursor-pointer"
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <h4 className="text-sm font-medium text-gray-600 mb-2 font-tamil">
                {feature.titleTamil}
              </h4>
              <p className="text-gray-600 text-sm mb-1">
                {feature.description}
              </p>
              <p className="text-gray-500 text-xs font-tamil">
                {feature.descriptionTamil}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-3xl font-bold text-primary-600 mb-2">38+</div>
          <div className="text-gray-600">Crop Diseases Detected</div>
          <div className="text-sm text-gray-500 font-tamil">38+ பயிர் நோய்கள் கண்டறியப்பட்டன</div>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-3xl font-bold text-primary-600 mb-2">2</div>
          <div className="text-gray-600">Languages Supported</div>
          <div className="text-sm text-gray-500 font-tamil">2 மொழிகள் ஆதரிக்கப்படுகின்றன</div>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
          <div className="text-gray-600">AI Assistant Available</div>
          <div className="text-sm text-gray-500 font-tamil">24/7 AI உதவியாளர் கிடைக்கிறது</div>
        </div>
      </div>
    </div>
  )
}