import { useState, useMemo } from 'react'
import { useAppContext } from '../App'
import { ArrowLeft, X, Check, Info, ChevronRight } from 'lucide-react'

export default function SeatSelectionPage() {
  const { selectedMatch, selectedCategory, setCurrentView, selectedSeats, toggleSeatSelection, clearSeatSelection, setSelectedCategory } = useAppContext()
  const [hoveredSeat, setHoveredSeat] = useState(null)

  if (!selectedMatch || !selectedCategory) {
    setCurrentView('home')
    return null
  }

  const seats = useMemo(() => {
    const allSeats = []
    const rows = selectedCategory.rows
    const seatsPerRow = selectedCategory.seatsPerRow
    
    for (let row = 0; row < rows; row++) {
      const rowLabel = String.fromCharCode(65 + row)
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const isOccupied = Math.random() < 0.2
        allSeats.push({
          id: `${rowLabel}${seat}`,
          row: rowLabel,
          number: seat,
          category: selectedCategory.name,
          price: selectedCategory.price,
          status: isOccupied ? 'occupied' : 'available'
        })
      }
    }
    return allSeats
  }, [selectedCategory])

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const convenienceFee = Math.round(totalPrice * 0.05)
  const gst = Math.round(totalPrice * 0.18)
  const finalTotal = totalPrice + convenienceFee + gst

  const handleProceed = () => {
    if (selectedSeats.length > 0) {
      setCurrentView('checkout')
    }
  }

  const handleBack = () => {
    clearSeatSelection()
    setSelectedCategory(null)
    setCurrentView('match-details')
  }

  const groupedSeats = useMemo(() => {
    const groups = {}
    seats.forEach(seat => {
      if (!groups[seat.row]) groups[seat.row] = []
      groups[seat.row].push(seat)
    })
    return groups
  }, [seats])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#666666] hover:text-[#222222] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Categories</span>
            </button>
            <h1 className="font-semibold text-[#222222]">Select Seats</h1>
            <button
              onClick={clearSeatSelection}
              className="text-sm text-[#F84464] hover:text-[#E03454]"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-[#F5F5F5] rounded-lg p-6 sm:p-8">
              {/* Screen */}
              <div className="text-center mb-8">
                <div className="h-2 bg-gradient-to-r from-[#D5D5D5] via-[#999999] to-[#D5D5D5] rounded-full mb-2" />
                <p className="text-xs text-[#666666]">SCREEN</p>
              </div>

              {/* Seats Grid */}
              <div className="space-y-3 overflow-x-auto">
                {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center gap-2 min-w-max">
                    <span className="w-6 text-sm text-[#666666] font-medium">{row}</span>
                    <div className="flex gap-1.5">
                      {rowSeats.map(seat => {
                        const isSelected = selectedSeats.find(s => s.id === seat.id)
                        return (
                          <button
                            key={seat.id}
                            onClick={() => seat.status === 'available' && toggleSeatSelection(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            disabled={seat.status === 'occupied'}
                            className={`
                              w-8 h-8 rounded text-xs font-medium transition-all duration-200
                              ${seat.status === 'occupied' 
                                ? 'bg-[#E5E5E5] text-[#999999] cursor-not-allowed'
                                : isSelected
                                  ? 'bg-[#F84464] text-white'
                                  : 'bg-white border border-[#D5D5D5] text-[#666666] hover:border-[#F84464] hover:text-[#F84464]'
                              }
                            `}
                          >
                            {seat.number}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white border border-[#D5D5D5]" />
                  <span className="text-sm text-[#666666]">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#F84464]" />
                  <span className="text-sm text-[#666666]">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#E5E5E5]" />
                  <span className="text-sm text-[#666666]">Occupied</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 bg-white rounded-lg border border-[#E5E5E5] p-4">
              <h3 className="font-medium text-[#222222] mb-4">Booking Summary</h3>
              
              {selectedSeats.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="flex items-center justify-between text-sm">
                        <span className="text-[#666666]">{seat.row}{seat.number} ({seat.category})</span>
                        <span className="text-[#222222] font-medium">₹{seat.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-[#E5E5E5] pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#666666]">Subtotal</span>
                      <span className="text-[#222222]">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#666666]">Convenience Fee</span>
                      <span className="text-[#222222]">₹{convenienceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#666666]">GST (18%)</span>
                      <span className="text-[#222222]">₹{gst.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#E5E5E5] pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#222222]">Total</span>
                      <span className="font-bold text-[#F84464] text-lg">₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#999999] text-center py-8">No seats selected</p>
              )}

              <button
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
                className={`
                  w-full mt-4 py-3 rounded-md font-medium text-white
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${selectedSeats.length > 0 
                    ? 'bg-[#F84464] hover:bg-[#E03454]' 
                    : 'bg-[#E5E5E5] cursor-not-allowed'
                  }
                `}
              >
                Proceed
                <ChevronRight className="w-4 h-4" />
              </button>

              {selectedSeats.length > 0 && (
                <p className="text-xs text-[#666666] mt-3 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5" />
                  Maximum 10 seats can be selected per booking
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
