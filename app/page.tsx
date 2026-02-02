import Link from 'next/link'
import { RocketLaunchIcon, BeakerIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function LaunchingSoon() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] opacity-50 animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 relative">
        <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-100 px-4 py-2 rounded-full text-primary-700 text-sm font-bold animate-bounce mt-10">
          <SparklesIcon className="w-4 h-4" />
          <span>Coming Soon to Your Fields</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
            AgriPulse <span className="text-primary-600 italic">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            The future of farming is arriving. An AI-powered ecosystem designed to empower every farmer with
            <span className="text-gray-900 border-b-2 border-primary-400 mx-1">precision intelligence</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10">
          <div className="p-6 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl text-left hover:shadow-xl transition-all">
            <RocketLaunchIcon className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="font-bold text-gray-900">Instant Diagnosis</h3>
            <p className="text-sm text-gray-500 mt-1">AI vision for crop diseases.</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl text-left hover:shadow-xl transition-all">
            <BeakerIcon className="w-8 h-8 text-emerald-600 mb-4" />
            <h3 className="font-bold text-gray-900">Soil Insights</h3>
            <p className="text-sm text-gray-500 mt-1">Sensor-free moisture mapping.</p>
          </div>
          <div className="p-6 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl text-left hover:shadow-xl transition-all">
            <GlobeAltIcon className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold text-gray-900">Multi-Language</h3>
            <p className="text-sm text-gray-500 mt-1">Localized support including Tamil.</p>
          </div>
        </div>

        <div className="pt-12 text-center">
          <div className="text-gray-400 text-sm uppercase tracking-[0.2em] font-black mb-6">Estimated Launch</div>
          <div className="flex justify-center space-x-8 text-4xl md:text-6xl font-black text-primary-600">
            <div className="flex flex-col">
              <span>Q1</span>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase mt-2">Season</span>
            </div>
            <div className="flex flex-col">
              <span>2026</span>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase mt-2">Year</span>
            </div>
          </div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          <p className="text-sm text-gray-500 font-tamil">
            விவசாயத்தின் எதிர்காலம் விரைவில் உங்கள் கைகளில்.
          </p>
        </div>
      </div>
    </div>
  )
}