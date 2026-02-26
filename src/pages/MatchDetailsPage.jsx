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

  // Debug logging
  console.log('📋 Selected Match:', selectedMatch)
  console.log('📋 Categories:', selectedMatch.categories)

  // Ensure all 5 categories exist with proper defaults
  const ensureCategories = (cats) => {
    const defaultCategories = [
      { name: 'VIP', price: 10000, rows: 4, seatsPerRow: 15, color: '#8B5CF6' },
      { name: 'Premium', price: 7500, rows: 5, seatsPerRow: 20, color: '#F59E0B' },
      { name: 'Gold', price: 5000, rows: 8, seatsPerRow: 25, color: '#EAB308' },
      { name: 'Silver', price: 3500, rows: 10, seatsPerRow: 30, color: '#9CA3AF' },
      { name: 'General', price: 1500, rows: 15, seatsPerRow: 40, color: '#22C55E' }
    ]
    
    if (!cats || cats.length === 0) return defaultCategories
    
    // Merge existing categories with defaults
    return defaultCategories.map(defaultCat => {
      const existing = cats.find(c => c.name === defaultCat.name)
      return existing ? { ...defaultCat, ...existing } : defaultCat
    })
  }

  const categories = ensureCategories(selectedMatch.categories)
  console.log('📋 Ensured Categories:', categories)

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
      setSelectedCategory(selectedCategory)
      setSelectedSeats(selectedSeats.map(seatId => ({
        id: seatId,
        section: seatId.split('-')[0],
        row: seatId.split('-')[1],
        seat: seatId.split('-')[2],
        price: selectedCategory.price
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

            {/* Categories - Dynamic from match data */}
            <h2 className="text-xl font-bold text-[#222222] mb-4">Select Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategorySelect(category)}
                  className="group relative overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300 text-left border border-gray-200"
                >
                  <div 
                    className="relative h-40 p-4"
                    style={{ 
                      background: category.name === 'VIP' 
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
                        : category.name === 'Premium'
                        ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
                        : category.name === 'Gold'
                        ? 'linear-gradient(135deg, #EAB308 0%, #FDE047 100%)'
                        : category.name === 'Silver'
                        ? 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
                        : 'linear-gradient(135deg, #22C55E 0%, #86EFAC 100%)'
                    }}
                  >
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span 
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: category.color || (
                              category.name === 'VIP' ? '#8B5CF6' :
                              category.name === 'Premium' ? '#F59E0B' :
                              category.name === 'Gold' ? '#EAB308' :
                              category.name === 'Silver' ? '#9CA3AF' :
                              '#22C55E'
                            )
                          }}
                        />
                        <span className="text-gray-800 text-sm font-medium">{category.name}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
                        <span className="px-2 py-1 bg-gray-800 text-white rounded text-sm font-bold">
                          ₹{category.price?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {category.rows || 0} rows × {category.seatsPerRow || 0} seats per row
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {(category.rows || 0) * (category.seatsPerRow || 0)} total seats
                        </span>
                        <span className="text-sm text-[#F84464] font-medium flex items-center gap-1">
                          Select
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

              {/* Price Categories - Dynamic from match data */}
              <div className="flex-1 overflow-y-auto">
                {categories.map((category) => {
                  const catColor = category.color || (
                    category.name === 'VIP' ? '#8B5CF6' :
                    category.name === 'Premium' ? '#F59E0B' :
                    category.name === 'Gold' ? '#EAB308' :
                    category.name === 'Silver' ? '#9CA3AF' :
                    '#22C55E'
                  )
                  const bgColor = category.name === 'VIP' ? 'bg-purple-50' :
                    category.name === 'Premium' ? 'bg-amber-50' :
                    category.name === 'Gold' ? 'bg-yellow-50' :
                    category.name === 'Silver' ? 'bg-gray-50' :
                    'bg-green-50'
                  const hoverBg = category.name === 'VIP' ? 'hover:bg-purple-100' :
                    category.name === 'Premium' ? 'hover:bg-amber-100' :
                    category.name === 'Gold' ? 'hover:bg-yellow-100' :
                    category.name === 'Silver' ? 'hover:bg-gray-100' :
                    'hover:bg-green-100'
                  
                  return (
                    <div key={category.name} className="border-b border-gray-100">
                      <button 
                        onClick={() => toggleCategory(category.price)}
                        className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 ${bgColor}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: catColor }} />
                          <span className="text-sm font-medium text-gray-700">₹{category.price?.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">({category.name})</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === category.price ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedCategory === category.price && (
                        <div className={bgColor}>
                          {Array.from({ length: Math.min(10, category.rows || 5) }).map((_, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleBlockSelect(`${category.name} Block ${String.fromCharCode(65 + i)}`, category.price)}
                              className={`w-full text-left px-3 py-2 text-xs text-gray-600 ${hoverBg} border-t border-gray-100`}
                            >
                              {category.name} Block {String.fromCharCode(65 + i)} (₹{category.price?.toLocaleString()}.00)
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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

                  {/* Stadium Layout - Cricket Ground with Pitch Only */}
                  {(() => {
                    return (
                      <>
                        {/* Green Cricket Field */}
                        <circle cx="500" cy="500" r="115" fill="#228B22" stroke="white" strokeWidth="4" />
                        
                        {/* Cricket Pitch - VERTICAL */}
                        <rect x="495" y="460" width="10" height="80" fill="white" rx="1" />
                        
                        {/* Pitch markings */}
                        <line x1="500" y1="460" x2="500" y2="540" stroke="#ccc" strokeWidth="0.5" />
                        
                        {/* First Ring - Close to ground */}
                        {(() => {
                          const firstRingSections = []
                          const sectionCount = 16
                          const innerR = 120
                          const outerR = 160
                          const anglePerSection = 360 / sectionCount
                          
                          for (let i = 0; i < sectionCount; i++) {
                            const startAngle = -180 + (i * anglePerSection) + 2
                            const endAngle = startAngle + anglePerSection - 4
                            const sectionId = `A${i + 1}`
                            
                            // Create wedge path
                            const toRad = (deg) => (deg * Math.PI) / 180
                            const x1 = 500 + innerR * Math.cos(toRad(startAngle))
                            const y1 = 500 + innerR * Math.sin(toRad(startAngle))
                            const x2 = 500 + outerR * Math.cos(toRad(startAngle))
                            const y2 = 500 + outerR * Math.sin(toRad(startAngle))
                            const x3 = 500 + outerR * Math.cos(toRad(endAngle))
                            const y3 = 500 + outerR * Math.sin(toRad(endAngle))
                            const x4 = 500 + innerR * Math.cos(toRad(endAngle))
                            const y4 = 500 + innerR * Math.sin(toRad(endAngle))
                            const path = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`
                            
                            // Calculate label position - between seats and ground
                            const labelR = innerR - 6  // Between ground and first row of seats
                            const labelX = 500 + labelR * Math.cos(toRad((startAngle + endAngle) / 2))
                            const labelY = 500 + labelR * Math.sin(toRad((startAngle + endAngle) / 2))
                            
                            firstRingSections.push(
                              <g key={sectionId}>
                                {/* Section wedge */}
                                <path
                                  d={path}
                                  fill="#C0C0C0"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                                
                                {/* Row lines and seats */}
                                {Array.from({ length: 4 }).map((_, rowIdx) => {
                                  const rowR = innerR + (outerR - innerR) * ((rowIdx + 1) / 5)
                                  const arcAngle = Math.abs(endAngle - startAngle)
                                  const arcLength = (arcAngle * Math.PI / 180) * rowR
                                  const seatSize = 8
                                  const maxSeats = Math.max(2, Math.min(6, Math.floor((arcLength - 10) / (seatSize + 2))))
                                  
                                  const rowElements = []
                                  
                                  // Row arc line
                                  const lx = 500 + rowR * Math.cos(toRad(startAngle))
                                  const ly = 500 + rowR * Math.sin(toRad(startAngle))
                                  const rx = 500 + rowR * Math.cos(toRad(endAngle))
                                  const ry = 500 + rowR * Math.sin(toRad(endAngle))
                                  const arcPath = `M ${lx} ${ly} A ${rowR} ${rowR} 0 0 1 ${rx} ${ry}`
                                  rowElements.push(<path key={`row-${rowIdx}`} d={arcPath} fill="none" stroke="white" strokeWidth="1" />)
                                  
                                  // Seats in this row
                                  for (let seatIdx = 0; seatIdx < maxSeats; seatIdx++) {
                                    const seatAngle = startAngle + (arcAngle * (seatIdx + 1)) / (maxSeats + 1)
                                    const seatX = 500 + rowR * Math.cos(toRad(seatAngle))
                                    const seatY = 500 + rowR * Math.sin(toRad(seatAngle))
                                    const seatId = `${sectionId}-R${rowIdx + 1}-${seatIdx + 1}`
                                    const isSelected = selectedSeats.includes(seatId)
                                    
                                    rowElements.push(
                                      <rect
                                        key={seatId}
                                        x={seatX - seatSize/2}
                                        y={seatY - seatSize/2}
                                        width={seatSize}
                                        height={seatSize}
                                        fill={isSelected ? '#F84464' : 'white'}
                                        stroke={isSelected ? '#F84464' : '#9CA3AF'}
                                        strokeWidth="0.5"
                                        rx="1"
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStadiumSeatSelect(seatId)
                                        }}
                                      />
                                    )
                                  }
                                  
                                  return <g key={`row-group-${rowIdx}`}>{rowElements}</g>
                                })}
                                
                                {/* Section label - BLACK text between ground and seats */}
                                <text
                                  x={labelX}
                                  y={labelY}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill="black"
                                  fontSize="8"
                                  fontWeight="bold"
                                  className="pointer-events-none select-none"
                                >
                                  {sectionId}
                                </text>
                              </g>
                            )
                          }
                          
                          return firstRingSections
                        })()}
                      </>
                    )
                  })()}
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
