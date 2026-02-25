import { useAppContext } from '../App'
import { ArrowRight, Ticket } from 'lucide-react'

export default function Hero() {
  const { setCurrentView } = useAppContext()

  return (
    <section className="relative bg-gradient-to-br from-[#F84464] to-[#E03454] text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-stadium.jpg" 
          alt="Stadium" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white text-gray-800 rounded-full text-sm font-medium mb-4 border border-white/30">
            <span className="w-2 h-2 bg-[#F84464] rounded-full"></span>
            Live Sports 2024
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Experience Live Cricket Like Never Before
          </h1>
          <p className="text-base sm:text-lg text-white/80 mb-6 leading-relaxed max-w-lg">
            Book tickets for IPL matches, international games, and more at the best stadiums across India.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className="px-5 py-2.5 bg-[#F84464] text-white font-medium rounded-md hover:bg-[#E03454] transition-all duration-200 flex items-center gap-2"
            >
              Book Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView('admin-bookings')}
              className="px-5 py-2.5 bg-white text-[#333333] font-medium rounded-md hover:bg-gray-100 transition-all duration-200"
            >
              My Bookings
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2">
          <Ticket className="w-48 h-48 text-white/10" />
        </div>
      </div>
    </section>
  )
}
