import { CloudIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-emerald-600 rounded-lg p-1.5">
                <CloudIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-lg">AgriPulse AI</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering farmers with AI-driven insights, leaf disease diagnosis, and real-time weather recommendations.
            </p>
            <p className="text-gray-400 text-xs font-tamil mt-2">விவசாயிகளுக்கான AI தீர்வுகள்</p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/chat" className="hover:text-emerald-600 transition-colors">AI Farm Assistant</a></li>
              <li><a href="/crop-analysis" className="hover:text-emerald-600 transition-colors">Leaf Disease Analysis</a></li>
              <li><a href="/soil-prediction" className="hover:text-emerald-600 transition-colors">Soil Moisture Prediction</a></li>
              <li><a href="/weather" className="hover:text-emerald-600 transition-colors">Weather-Based Tips</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Built With</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Next.js 14 &amp; React</li>
              <li>Groq — Llama 3 &amp; Llama 4 Scout</li>
              <li>Open-Meteo Weather API</li>
              <li>PostgreSQL &amp; Prisma ORM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} AgriPulse AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <HeartIcon className="w-3.5 h-3.5 text-red-400" /> for farmers
          </p>
        </div>
      </div>
    </footer>
  )
}
