import { useAppContext } from '../App'
import { ArrowLeft, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react'

export default function MatchDetailsPage() {
  const { selectedMatch, setCurrentView, setSelectedCategory } = useAppContext()

  if (!selectedMatch) {
    setCurrentView('home')
    return null
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setCurrentView('seat-selection')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-[#666666] hover:text-[#222222] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Events</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Match Info */}
          <div className="lg:col-span-2">
            <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden mb-6">
              <img
                src={selectedMatch.image}
                alt={`${selectedMatch.team1} vs ${selectedMatch.team2}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {selectedMatch.team1} vs {selectedMatch.team2}
                </h1>
                <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedMatch.stadium}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedMatch.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedMatch.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <h2 className="text-xl font-bold text-[#222222] mb-4">Select Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedMatch.categories.map(category => (
                <button
                  key={category.name}
                  onClick={() => handleCategorySelect(category)}
                  className="p-4 border border-[#E5E5E5] rounded-lg hover:border-[#F84464] hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#222222]">{category.name}</h3>
                    <span className="text-[#F84464] font-bold">₹{category.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#666666] mb-3">
                    {category.rows} rows × {category.seatsPerRow} seats per row
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999999]">
                      {category.rows * category.seatsPerRow} seats available
                    </span>
                    <span className="text-sm text-[#F84464] font-medium flex items-center gap-1">
                      Select {category.name}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Info Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-[#F5F5F5] rounded-lg">
                <h4 className="font-medium text-[#222222] mb-2 text-sm">Cancellation</h4>
                <p className="text-xs text-[#666666]">Cancel up to 48 hours before the match for a full refund.</p>
              </div>
              <div className="p-4 bg-[#F5F5F5] rounded-lg">
                <h4 className="font-medium text-[#222222] mb-2 text-sm">Entry Guidelines</h4>
                <p className="text-xs text-[#666666]">Arrive 1 hour early. Carry valid ID proof with ticket.</p>
              </div>
              <div className="p-4 bg-[#F5F5F5] rounded-lg">
                <h4 className="font-medium text-[#222222] mb-2 text-sm">Need Help?</h4>
                <p className="text-xs text-[#666666]">Contact support@ticketnest.com or call 1800-123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
