import { CloudIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand + Languages */}
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
            <div className="flex items-center gap-2 mt-4">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">English</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 font-tamil">தமிழ்</span>
            </div>
          </div>

          {/* Features + Quick Stats */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/chat" className="hover:text-emerald-600 transition-colors">AI Farm Assistant</a></li>
              <li><a href="/crop-analysis" className="hover:text-emerald-600 transition-colors">Leaf Disease Analysis</a></li>
              <li><a href="/soil-prediction" className="hover:text-emerald-600 transition-colors">Soil Moisture Prediction</a></li>
              <li><a href="/weather" className="hover:text-emerald-600 transition-colors">Weather-Based Tips</a></li>
              </ul>
          </div>

          {/* Mission + Disclaimer */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Our Mission</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              AgriPulse AI bridges the gap between modern technology and traditional farming — giving smallholder farmers intelligent tools that were once only available to large agribusinesses.
            </p>
            {/* <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Disclaimer</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                AI-generated advice is for informational purposes only. Always consult a certified agronomist before making critical farming decisions.
              </p>
            </div> */}
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
