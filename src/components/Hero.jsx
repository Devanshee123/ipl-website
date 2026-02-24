import { useAppContext } from '../App'
import { ArrowRight, Ticket } from 'lucide-react'

export default function Hero() {
  const { setCurrentView } = useAppContext()

  return (
    <section className="relative bg-gradient-to-br from-[#F84464] to-[#E03454] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Book Your IPL Tickets Now
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
            Experience the thrill of live cricket. Secure your seats for the most exciting matches of the season.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setCurrentView('home')}
              className="px-6 py-3 bg-white text-[#F84464] font-semibold rounded-md hover:bg-white/90 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
            >
              Book Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView('admin-bookings')}
              className="px-6 py-3 bg-white/20 text-white font-semibold rounded-md hover:bg-white/30 transition-all duration-200"
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
