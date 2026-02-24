import { useState, useEffect, useRef } from 'react'
import { useAppContext } from '../App'
import { MapPin, Calendar, Clock, ChevronDown, ChevronRight, Filter, Search } from 'lucide-react'

export default function MatchesSection() {
  const { matches, selectedCity, selectedStadium, setSelectedStadium, stadiums, setCurrentView, setSelectedMatch } = useAppContext()
  const [isVisible, setIsVisible] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ date: true, category: true, price: true, stadium: true })
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.1 })

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const filteredMatches = matches.filter(match => {
    const cityMatch = selectedCity === 'All Cities' || match.city === selectedCity
    const stadiumMatch = selectedStadium === 'All Stadiums' || match.stadium === selectedStadium
    return cityMatch && stadiumMatch
  })

  const handleBookClick = (match) => {
    setSelectedMatch(match)
    setCurrentView('match-details')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section ref={sectionRef} className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-[#E5E5E5] sticky top-36">
              <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
                <h3 className="font-medium text-[#222222]">Filters</h3>
                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <Filter className="w-5 h-5 text-[#666666]" />
                </button>
              </div>
              
              <div className={`p-4 space-y-4 ${showFilters ? '' : 'hidden lg:block'}`}>
                {/* Stadium Filter */}
                <div>
                  <button
                    onClick={() => toggleFilter('stadium')}
                    className="w-full flex items-center justify-between text-sm font-medium text-[#222222] mb-3"
                  >
                    Stadium
                    <ChevronDown className={`w-4 h-4 transition-transform ${filters.stadium ? '' : '-rotate-90'}`} />
                  </button>
                  {filters.stadium && (
                    <div className="space-y-2">
                      {stadiums.map(stadium => (
                        <label key={stadium} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="stadium"
                            checked={selectedStadium === stadium}
                            onChange={() => setSelectedStadium(stadium)}
                            className="w-4 h-4 accent-[#F84464]"
                          />
                          <span className="text-sm text-[#666666]">{stadium}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#222222] mb-2">Upcoming Matches</h2>
              <p className="text-[#666666]">{filteredMatches.length} events found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMatches.map((match, index) => (
                <div
                  key={match.id}
                  className={`group bg-white rounded-lg border border-[#E5E5E5] overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 hover:border-[#D5D5D5] ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={match.image}
                      alt={`${match.team1} vs ${match.team2}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 rounded text-sm font-medium text-[#222222] shadow-sm">
                      ₹{match.startingPrice.toLocaleString()}+
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-[#222222] mb-2 line-clamp-1">
                      {match.team1Short} vs {match.team2Short}
                    </h3>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#666666]">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.stadium}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#666666]">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(match.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#666666]">
                        <Clock className="w-3.5 h-3.5" />
                        {match.time}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBookClick(match)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F84464] text-white text-sm font-medium rounded-md hover:bg-[#E03454] transition-colors active:scale-[0.98] group/btn"
                    >
                      Book Tickets
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMatches.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                  <Search className="w-8 h-8 text-[#999999]" />
                </div>
                <h3 className="text-lg font-medium text-[#222222] mb-1">No events found</h3>
                <p className="text-sm text-[#666666]">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
