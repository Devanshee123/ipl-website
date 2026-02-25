import { useAppContext } from '../App'
import { ArrowLeft, MapPin, Calendar, Clock, ChevronRight, X, Car, Bus, Truck, Users, Bike } from 'lucide-react'
import { useState } from 'react'

export default function MatchDetailsPage() {
  const { selectedMatch, setCurrentView, setSelectedCategory, setSelectedSeats } = useAppContext()
  const [showSeatCountModal, setShowSeatCountModal] = useState(false)
  const [showStadiumModal, setShowStadiumModal] = useState(false)
  const [selectedCategory, setSelectedCategoryLocal] = useState(null)
  const [seatCount, setSeatCount] = useState(2)
  const [selectedSeats, setSelectedSeatsLocal] = useState([])
  const [stadiumZoom, setStadiumZoom] = useState(1)
  const [stadiumPan, setStadiumPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  if (!selectedMatch) {
    setCurrentView('home')
    return null
  }

  const handleCategorySelect = (category) => {
    setSelectedCategoryLocal(category)
    setSeatCount(2)
    setShowSeatCountModal(true)
  }

  const handleContinueToStadium = () => {
    setShowSeatCountModal(false)
    setShowStadiumModal(true)
    setSelectedSeatsLocal([])
  }

  const [expandedCategory, setExpandedCategory] = useState(null)

  const toggleCategory = (price) => {
    setExpandedCategory(expandedCategory === price ? null : price)
  }

  const handleStadiumSeatSelect = (seatId) => {
    setSelectedSeatsLocal(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      }
      if (prev.length >= seatCount) {
        return [...prev.slice(1), seatId]
      }
      return [...prev, seatId]
    })
  }

  const handleStadiumSectionClick = (section) => {
    if (isDragging) return // Don't select if user was dragging
    const row = Math.floor(Math.random() * section.rows) + 1
    const seat = Math.floor(Math.random() * 20) + 1
    const seatId = `${section.id}-${row}-${seat}`
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeatsLocal(prev => prev.filter(id => id !== seatId))
    } else if (selectedSeats.length < seatCount) {
      setSelectedSeatsLocal(prev => [...prev, seatId])
    }
  }

  // Drag/Pan handlers
  const handleMouseDown = (e) => {
    setIsDragging(false)
    setDragStart({ x: e.clientX - stadiumPan.x, y: e.clientY - stadiumPan.y })
  }

  const handleMouseMove = (e) => {
    if (e.buttons === 1) { // Left mouse button is pressed
      setIsDragging(true)
      setStadiumPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 50) // Small delay to prevent click after drag
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setStadiumZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  const resetView = () => {
    setStadiumZoom(1)
    setStadiumPan({ x: 0, y: 0 })
  }

  const handleBlockSelect = (blockName, price) => {
    // Generate seats for this block
    const sectionId = blockName.split(' ')[1]
    const row = 1
    const seat = 1
    const seatId = `${sectionId}-${row}-${seat}`
    
    if (selectedSeats.length < seatCount) {
      setSelectedSeatsLocal(prev => [...prev, seatId])
    }
  }

  const handleConfirmSeats = () => {
    if (selectedSeats.length > 0) {
      setSelectedCategory(selectedCategoryLocal)
      setSelectedSeats(selectedSeats.map(seatId => ({
        id: seatId,
        section: seatId.split('-')[0],
        row: seatId.split('-')[1],
        seat: seatId.split('-')[2],
        price: selectedCategoryLocal.price
      })))
      setShowStadiumModal(false)
      setCurrentView('checkout')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getVehicleIcon = (count) => {
    if (count <= 1) return Bike
    if (count <= 2) return Car
    if (count <= 4) return Users
    if (count <= 6) return Truck
    return Bus
  }

  const getVehicleLabel = (count) => {
    if (count <= 1) return 'Solo Ride'
    if (count <= 2) return 'Couple Drive'
    if (count <= 4) return 'Family Trip'
    if (count <= 6) return 'Group Travel'
    return 'Team Bus'
  }

  const generateStadiumSections = (category) => {
    if (!category) return []
    const sections = []
    const sectionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R']
    
    sectionLabels.forEach((label, index) => {
      const isPremium = ['D', 'E', 'F', 'A'].includes(label)
      const isVIP = label === 'A' || label === 'B'
      
      sections.push({
        id: label,
        name: `Section ${label}`,
        type: isVIP ? 'VIP' : isPremium ? 'Premium' : 'Standard',
        rows: isVIP ? 5 : isPremium ? 8 : 10,
        seatsPerRow: isVIP ? 10 : isPremium ? 15 : 20,
        price: isVIP ? category.price * 1.5 : isPremium ? category.price : category.price * 0.7,
        color: isVIP ? '#9C27B0' : isPremium ? '#00BCD4' : '#F84464',
        angle: (index * 22.5) - 90
      })
    })
    
    return sections
  }

  const stadiumSections = showStadiumModal ? generateStadiumSections(selectedCategory) : []

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
              {/* VIP Card */}
              <button
                onClick={() => handleCategorySelect(selectedMatch.categories.find(c => c.name === 'VIP') || selectedMatch.categories[0])}
                className="group relative overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className="relative h-48 bg-gradient-to-b from-[#F84464]/70 to-white">
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="text-gray-800 text-sm font-medium">VIP</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">VIP Experience</h3>
                      <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-sm font-bold text-gray-800">
                        ₹{selectedMatch.categories.find(c => c.name === 'VIP')?.price?.toLocaleString() || selectedMatch.categories[0]?.price?.toLocaleString() || '10000'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Ultimate luxury with personalized service
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Limited seats available
                      </span>
                      <span className="text-sm text-[#F84464] font-medium flex items-center gap-1">
                        Select VIP
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Regular Category Cards */}
              {selectedMatch.categories.map(category => (
                <button
                  key={category.name}
                  onClick={() => handleCategorySelect(category)}
                  className="group relative overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="relative h-48 bg-gradient-to-b from-[#F84464]/70 to-white">
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-gray-800 text-sm font-medium">{category.name}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-sm font-bold text-gray-800">
                          ₹{category.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {category.rows} rows × {category.seatsPerRow} seats per row
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {category.rows * category.seatsPerRow} seats available
                        </span>
                        <span className="text-sm text-[#F84464] font-medium flex items-center gap-1">
                          Select {category.name}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
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

      {/* Step 1: Seat Count Selection Modal */}
      {showSeatCountModal && selectedCategory && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            {/* Timer Header */}
            <div className="bg-gradient-to-r from-[#F84464] to-[#8B5CF6] text-white px-6 py-3">
              <p className="text-sm">You have <span className="font-bold">approximately 4 minutes</span> to select your seats.</p>
            </div>

            <div className="p-8 text-center">
              {/* Title */}
              <h3 className="text-2xl font-bold text-[#222222] mb-8">How many seats?</h3>

              {/* Vehicle Icon */}
              <div className="mb-8">
                {(() => {
                  const VehicleIcon = getVehicleIcon(seatCount)
                  return (
                    <div className="text-center">
                      <VehicleIcon className="w-32 h-32 mx-auto text-[#F84464] mb-3" />
                      <p className="text-sm text-[#666666]">{getVehicleLabel(seatCount)}</p>
                    </div>
                  )
                })()}
              </div>

              {/* Seat Count Selector */}
              <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    onClick={() => setSeatCount(num)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                      seatCount === num
                        ? 'bg-[#F84464] text-white scale-110'
                        : 'bg-gray-100 text-[#666666] hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Info Box */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">i</span>
                </div>
                <p className="text-sm text-[#666666] text-left">
                  {seatCount} is the minimum and 10 is the maximum quantity of tickets you can purchase for this event.
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinueToStadium}
                className="w-full py-3 bg-[#F84464] text-white font-semibold rounded-lg hover:bg-[#E03454] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Stadium Layout Modal */}
      {showStadiumModal && selectedCategory && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F84464] to-[#8B5CF6] text-white px-6 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Select Your Seats - {selectedCategory.name}</h3>
              <p className="text-sm opacity-90">{selectedSeats.length} of {seatCount} seats selected</p>
            </div>
            <button
              onClick={() => setShowStadiumModal(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Match Info & Expandable Price Categories */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
              {/* Match Info */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    {selectedMatch.team1Short?.[0] || 'T1'}
                  </div>
                  <span className="text-gray-400 text-xs">vs</span>
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    {selectedMatch.team2Short?.[0] || 'T2'}
                  </div>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 mb-0.5">
                  {selectedMatch.team1} vs {selectedMatch.team2}
                </h4>
                <p className="text-xs text-gray-500">{selectedMatch.stadium}</p>
                <p className="text-xs text-gray-500">{new Date(selectedMatch.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, {selectedMatch.time}</p>
                <p className="text-xs text-gray-400 mt-2">Please select the category of your choice. It will get highlighted on the layout.</p>
              </div>

              {/* Price Categories - Expandable */}
              <div className="flex-1 overflow-y-auto">
                {/* Sold Out - Grey */}
                <div className="border-b border-gray-100">
                  <button 
                    onClick={() => toggleCategory(200)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-gray-400" />
                      <span className="text-sm font-medium text-gray-700">₹200</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 200 ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedCategory === 200 && (
                    <div className="bg-gray-50">
                      {['BLOCK J BAY 1-UPPER', 'BLOCK J BAY 2-UPPER', 'BLOCK J BAY 3-UPPER', 'BLOCK J BAY 4-UPPER', 'BLOCK J BAY 5-UPPER', 'BLOCK K BAY 1-UPPER', 'BLOCK K BAY 2-UPPER', 'BLOCK K BAY 3-UPPER', 'BLOCK K BAY 4-UPPER', 'BLOCK K BAY 5-UPPER', 'BLOCK K BAY 6-UPPER', 'BLOCK K BAY 7-UPPER', 'BLOCK K BAY 8-UPPER'].map((block, i) => (
                        <div key={i} className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">{block} (₹200.00)</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Silver - Teal */}
                <div className="border-b border-gray-100">
                  <button 
                    onClick={() => toggleCategory(400)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 bg-[#E0F7FA]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#00BCD4]" />
                      <span className="text-sm font-medium text-gray-700">₹400</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 400 ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedCategory === 400 && (
                    <div className="bg-[#E0F7FA]">
                      {['BLOCK A BAY 1-LOWER', 'BLOCK A BAY 2-LOWER', 'BLOCK A BAY 3-LOWER', 'BLOCK A BAY 4-LOWER', 'BLOCK B BAY 1-LOWER', 'BLOCK B BAY 2-LOWER', 'BLOCK B BAY 3-LOWER', 'BLOCK B BAY 4-LOWER', 'BLOCK B BAY 5-LOWER', 'BLOCK C BAY 1-LOWER', 'BLOCK C BAY 2-LOWER', 'BLOCK C BAY 3-LOWER', 'BLOCK C BAY 4-LOWER'].map((block, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleBlockSelect(block, 400)}
                          className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-[#B2EBF2] border-t border-cyan-100"
                        >
                          {block} (₹400.00)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* General - Pink */}
                <div className="border-b border-gray-100">
                  <button 
                    onClick={() => toggleCategory(1000)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 bg-pink-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#EC4899]" />
                      <span className="text-sm font-medium text-gray-700">₹1000</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 1000 ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedCategory === 1000 && (
                    <div className="bg-pink-50">
                      {['SOUTH PREM EAST BAY 1', 'SOUTH PREM EAST BAY 2', 'SOUTH PREM EAST BAY 3', 'SOUTH PREM EAST BAY 4', 'SOUTH PREM CENTER BAY 1', 'SOUTH PREM CENTER BAY 2', 'SOUTH PREM CENTER BAY 3'].map((block, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleBlockSelect(block, 1000)}
                          className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-pink-100 border-t border-pink-100"
                        >
                          {block} (₹1000.00)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gold - Sky Blue */}
                <div className="border-b border-gray-100">
                  <button 
                    onClick={() => toggleCategory(6000)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 bg-blue-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#0EA5E9]" />
                      <span className="text-sm font-medium text-gray-700">₹6000</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 6000 ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedCategory === 6000 && (
                    <div className="bg-blue-50">
                      {['PRESIDENT GALLERY L3 BAY2', 'PRESIDENT GALLERY L3 BAY3', 'PRES GALLERY PREM L3 BAY1', 'PRES GALLERY PREM L3 BAY2', 'PRES GALLERY PREM L3 BAY3', 'PRESGALLERY PREM L3 BAY6', 'PRESGALLERY PREM L3 BAY7', 'PRESGALLERY PREM L3 BAY8'].map((block, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleBlockSelect(block, 6000)}
                          className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-blue-100 border-t border-blue-100"
                        >
                          {block} (₹6000.00)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Premium - Yellow */}
                <div className="border-b border-gray-100">
                  <button 
                    onClick={() => toggleCategory(10000)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 bg-yellow-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
                      <span className="text-sm font-medium text-gray-700">₹10000</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 10000 ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedCategory === 10000 && (
                    <div className="bg-yellow-50">
                      {['Premium Suite 401', 'Premium Suite 402', 'Premium Suite 403', 'Premium Suite 404', 'Premium Suite 405', 'Premium Suite 406', 'Premium Suite 407', 'Premium Suite 408', 'Premium Suite 409', 'Premium Suite 410'].map((block, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleBlockSelect(block, 10000)}
                          className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-yellow-100 border-t border-yellow-100"
                        >
                          {block} (₹10000.00)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* VIP - Purple */}
                <div className="border-b border-gray-100">
                  <button 
                    onClick={() => toggleCategory(15000)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 bg-purple-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-[#8B5CF6]" />
                      <span className="text-sm font-medium text-gray-700">₹15000</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === 15000 ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedCategory === 15000 && (
                    <div className="bg-purple-50">
                      {['Presidential Suite 301', 'Presidential Suite 302', 'Presidential Suite 303', 'Presidential Suite 304', 'Presidential Suite 305', 'Presidential Suite 306', 'Presidential Suite 307', 'Presidential Suite 308', 'Presidential Suite 309', 'Presidential Suite 310'].map((block, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleBlockSelect(block, 15000)}
                          className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-purple-100 border-t border-purple-100"
                        >
                          {block} (₹15000.00)
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stadium View */}
            <div 
              className="flex-1 bg-[#F5F5F5] overflow-hidden relative cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* Zoom & Reset Controls - Top Right */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button
                  onClick={(e) => { e.stopPropagation(); setStadiumZoom(Math.min(3, stadiumZoom + 0.25)) }}
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center shadow-md"
                >
                  <span className="text-xl font-bold text-gray-600">+</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setStadiumZoom(Math.max(0.5, stadiumZoom - 0.25)) }}
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center shadow-md"
                >
                  <span className="text-xl font-bold text-gray-600">−</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); resetView() }}
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center shadow-md"
                  title="Reset View"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Zoom Level Indicator */}
              <div className="absolute top-4 left-4 z-20 bg-white/90 px-3 py-1.5 rounded-lg shadow-md border border-gray-200">
                <span className="text-sm text-gray-600 font-medium">{Math.round(stadiumZoom * 100)}%</span>
              </div>

              {/* Drag Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/70 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
                Drag to move • Scroll to zoom
              </div>

              <div 
                className="absolute top-1/2 left-1/2 transition-transform duration-75"
                style={{ 
                  transform: `translate(calc(-50% + ${stadiumPan.x}px), calc(-50% + ${stadiumPan.y}px)) scale(${stadiumZoom})`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Stadium Container - 1000x1000 for larger area */}
                <svg width="1000" height="1000" viewBox="0 0 1000 1000" className="overflow-visible">
                  <defs>
                    {/* Define wedge shape path generator */}
                  </defs>
                  
                  {/* Outer Ring - Premium Suites Level 5 */}
                  <circle cx="500" cy="500" r="430" fill="none" stroke="#D1D5DB" strokeWidth="2" />
                  
                  {/* Presidential Suites Level 4 */}
                  <circle cx="500" cy="500" r="390" fill="none" stroke="#D1D5DB" strokeWidth="2" />
                  
                  {/* Presidential Gallery Level 3 */}
                  <circle cx="500" cy="500" r="350" fill="none" stroke="#D1D5DB" strokeWidth="2" />
                  
                  {/* Middle Ring */}
                  <circle cx="500" cy="500" r="300" fill="none" stroke="#D1D5DB" strokeWidth="1" />
                  
                  {/* Inner Ring */}
                  <circle cx="500" cy="500" r="160" fill="none" stroke="#D1D5DB" strokeWidth="1" />

                  {/* Center Field */}
                  <circle cx="500" cy="500" r="115" fill="#228B22" stroke="white" strokeWidth="4" />
                  {/* Cricket pitch */}
                  <rect x="460" y="495" width="80" height="10" fill="white" fillOpacity="0.4" rx="2" />

                  {/* Stadium Wedge Sections */}
                  {/* Helper function to create wedge path */}
                  {(() => {
                    const createWedgePath = (innerR, outerR, startAngle, endAngle) => {
                      const toRad = (deg) => (deg * Math.PI) / 180
                      const x1 = 500 + innerR * Math.cos(toRad(startAngle))
                      const y1 = 500 + innerR * Math.sin(toRad(startAngle))
                      const x2 = 500 + outerR * Math.cos(toRad(startAngle))
                      const y2 = 500 + outerR * Math.sin(toRad(startAngle))
                      const x3 = 500 + outerR * Math.cos(toRad(endAngle))
                      const y3 = 500 + outerR * Math.sin(toRad(endAngle))
                      const x4 = 500 + innerR * Math.cos(toRad(endAngle))
                      const y4 = 500 + innerR * Math.sin(toRad(endAngle))
                      
                      const largeArc = endAngle - startAngle > 180 ? 1 : 0
                      
                      return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`
                    }
                    
                    // Outer ring sections (Pink - General) and Grey sold - based on reference image
                    const outerSections = [
                      // Left side
                      { id: 'L', color: '#C0C0C0', start: 158, end: 138, rows: 9, sold: true }, // Grey
                      { id: 'L2', color: '#EC4899', start: 136, end: 116, rows: 9 }, // Pink
                      { id: 'M', color: '#EC4899', start: 114, end: 94, rows: 9 },
                      { id: 'N', color: '#EC4899', start: 92, end: 72, rows: 9 },
                      // Top grey
                      { id: 'SOLD1', color: '#C0C0C0', start: 70, end: 50, rows: 9, sold: true },
                      // Right side
                      { id: 'P', color: '#EC4899', start: 48, end: 28, rows: 9 },
                      { id: 'Q', color: '#EC4899', start: 26, end: 6, rows: 9 },
                      { id: 'R', color: '#EC4899', start: 4, end: -16, rows: 9 },
                      // Bottom grey
                      { id: 'SOLD2', color: '#C0C0C0', start: -18, end: -38, rows: 9, sold: true },
                      // Continue
                      { id: 'K', color: '#EC4899', start: -158, end: -138, rows: 9 },
                      { id: 'J', color: '#EC4899', start: -136, end: -116, rows: 9 },
                      { id: 'SOLD3', color: '#C0C0C0', start: -114, end: -94, rows: 9, sold: true },
                    ]
                    
                    // Middle ring sections (Teal - Silver)
                    const middleSections = [
                      { id: 'C', color: '#00BCD4', start: 158, end: 138, rows: 9 },
                      { id: 'D', color: '#00BCD4', start: 136, end: 116, rows: 9 },
                      { id: 'E', color: '#00BCD4', start: 114, end: 94, rows: 9 },
                      { id: 'F', color: '#00BCD4', start: 92, end: 72, rows: 9 },
                      { id: 'G', color: '#00BCD4', start: 70, end: 50, rows: 9 },
                      { id: 'H', color: '#00BCD4', start: 48, end: 28, rows: 9 },
                      { id: 'B', color: '#00BCD4', start: -158, end: -138, rows: 9 },
                      { id: 'A', color: '#00BCD4', start: -136, end: -116, rows: 9 },
                    ]
                    
                    // Inner ring sections (Sky Blue - Gold)
                    const innerSections = [
                      { id: 'A2', color: '#0EA5E9', start: -158, end: -138, rows: 9 },
                      { id: 'B2', color: '#0EA5E9', start: -136, end: -116, rows: 9 },
                    ]
                    
                    // Render all sections
                    const allSections = [
                      ...outerSections.map(s => ({ ...s, innerR: 355, outerR: 425 })),
                      ...middleSections.map(s => ({ ...s, innerR: 220, outerR: 295 })),
                      ...innerSections.map(s => ({ ...s, innerR: 165, outerR: 218 })),
                    ]
                    
                    return allSections.map((section) => {
                      const path = createWedgePath(section.innerR, section.outerR, section.start, section.end)
                      const midAngle = (section.start + section.end) / 2
                      const midR = (section.innerR + section.outerR) / 2
                      const labelX = 500 + midR * Math.cos((midAngle * Math.PI) / 180)
                      const labelY = 500 + midR * Math.sin((midAngle * Math.PI) / 180)
                      
                      return (
                        <g key={section.id}>
                          {/* Wedge shape */}
                          <path
                            d={path}
                            fill={selectedSeats.some(s => s.startsWith(section.id)) ? '#F84464' : section.color}
                            stroke="white"
                            strokeWidth="2"
                            className={section.sold ? '' : 'cursor-pointer hover:opacity-90'}
                            style={{ transition: 'all 0.2s' }}
                            onClick={() => !section.sold && handleStadiumSectionClick(section)}
                          />
                          {/* Section label */}
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={section.sold ? '#666666' : 'white'}
                            fontSize="20"
                            fontWeight="bold"
                            className="pointer-events-none select-none"
                          >
                            {section.id.replace(/\d/g, '').replace('SOLD', '')}
                          </text>
                          {/* Row numbers inside wedge */}
                          {!section.sold && section.rows > 0 && (
                            <g className="pointer-events-none">
                              {Array.from({ length: Math.min(9, section.rows) }).map((_, i) => {
                                const rowR = section.innerR + (section.outerR - section.innerR) * ((i + 1) / (section.rows + 1))
                                const rowX = 500 + rowR * Math.cos((midAngle * Math.PI) / 180)
                                const rowY = 500 + rowR * Math.sin((midAngle * Math.PI) / 180)
                                // Offset based on angle for better readability
                                const offsetX = midAngle > 90 || midAngle < -90 ? -12 : 12
                                return (
                                  <text
                                    key={i}
                                    x={rowX + offsetX}
                                    y={rowY}
                                    textAnchor={offsetX < 0 ? "end" : "start"}
                                    dominantBaseline="middle"
                                    fill="white"
                                    fontSize="11"
                                    fontWeight="500"
                                    className="select-none"
                                  >
                                    {i + 1}
                                  </text>
                                )
                              })}
                            </g>
                          )}
                        </g>
                      )
                    })
                  })()}

                  {/* Center Pavilion */}
                  <rect x="495" y="480" width="10" height="40" fill="white" stroke="#D1D5DB" strokeWidth="1" />

                  {/* Premium/VIP Boxes - South (Yellow) */}
                  <g>
                    <path
                      d="M 460 580 L 540 580 L 530 610 L 470 610 Z"
                      fill={selectedSeats.some(s => s.startsWith('SOUTH')) ? '#F84464' : '#F59E0B'}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-90"
                      onClick={() => handleStadiumSectionClick({ id: 'SOUTH', color: '#F59E0B', type: 'Premium', rows: 4 })}
                    />
                    <text x="500" y="595" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">SOUTH</text>
                    <text x="500" y="605" textAnchor="middle" fill="white" fontSize="9" className="pointer-events-none select-none">PREMIUM</text>
                  </g>

                  {/* VIP Boxes - West (Purple) */}
                  <g>
                    <path
                      d="M 380 480 L 390 480 L 390 520 L 380 520 Z"
                      fill={selectedSeats.some(s => s.startsWith('WEST')) ? '#F84464' : '#8B5CF6'}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-90"
                      onClick={() => handleStadiumSectionClick({ id: 'WEST', color: '#8B5CF6', type: 'VIP', rows: 4 })}
                    />
                    <text x="385" y="505" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="pointer-events-none select-none" transform="rotate(-90, 385, 505)">WEST</text>
                  </g>

                  {/* VIP Boxes - East (Purple) */}
                  <g>
                    <path
                      d="M 610 480 L 620 480 L 620 520 L 610 520 Z"
                      fill={selectedSeats.some(s => s.startsWith('EAST')) ? '#F84464' : '#8B5CF6'}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-90"
                      onClick={() => handleStadiumSectionClick({ id: 'EAST', color: '#8B5CF6', type: 'VIP', rows: 4 })}
                    />
                    <text x="615" y="505" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="pointer-events-none select-none" transform="rotate(90, 615, 505)">EAST</text>
                  </g>

                  {/* North Core Box (Grey/Sold) */}
                  <g>
                    <rect x="480" y="410" width="40" height="30" fill="#9CA3AF" stroke="white" strokeWidth="2" />
                    <text x="500" y="430" textAnchor="middle" fill="white" fontSize="8" className="pointer-events-none select-none">NORTH CORE</text>
                  </g>

                  {/* Section Labels around the rings */}
                  <text x="500" y="445" textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="500">NORTH CORE BOX</text>
                  <text x="500" y="590" textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="500">SOUTH PREMIUM</text>
                  
                  {/* Outer ring labels */}
                  <text x="500" y="275" textAnchor="middle" fill="#9CA3AF" fontSize="11">PRESIDENT GALLERY LEVEL 3</text>
                  <text x="500" y="235" textAnchor="middle" fill="#9CA3AF" fontSize="11">PRESIDENTIAL SUITES LEVEL 4</text>
                  <text x="500" y="195" textAnchor="middle" fill="#9CA3AF" fontSize="11">PREMIUM SUITES LEVEL 5</text>
                </svg>
              </div>
            </div>

            {/* Right Sidebar - Selected Seats */}
            <div className="w-64 bg-white border-l border-gray-200 p-4 flex flex-col">
              <h4 className="font-medium text-gray-800 mb-4">Selected Seats</h4>
              
              {selectedSeats.length === 0 ? (
                <p className="text-sm text-gray-500">Click on a section to select seats</p>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {selectedSeats.map((seatId, index) => {
                    const [section, row, seat] = seatId.split('-')
                    return (
                      <div key={seatId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">
                          {index + 1}. Sec {section}, Row {row}, Seat {seat}
                        </span>
                        <button
                          onClick={() => handleStadiumSeatSelect(seatId)}
                          className="text-[#F84464] hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto space-y-2">
                <button
                  onClick={() => {
                    setShowStadiumModal(false)
                    setShowSeatCountModal(true)
                    setSelectedSeatsLocal([])
                  }}
                  className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Change Seat Count
                </button>
                <button
                  onClick={handleConfirmSeats}
                  disabled={selectedSeats.length === 0}
                  className="w-full py-3 bg-[#F84464] text-white font-semibold rounded-lg hover:bg-[#E03454] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm {selectedSeats.length} Seats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
