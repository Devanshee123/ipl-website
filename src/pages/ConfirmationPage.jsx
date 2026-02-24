import { useState, useEffect } from 'react'
import { useAppContext } from '../App'
import { CheckCircle, Download, Share2, Home, Ticket } from 'lucide-react'

export default function ConfirmationPage() {
  const { currentBooking, setCurrentView, clearSeatSelection } = useAppContext()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!currentBooking) {
    setCurrentView('home')
    return null
  }

  const handleDownload = () => {
    alert('Ticket downloaded successfully!')
  }

  const handleGoHome = () => {
    clearSeatSelection()
    setCurrentView('home')
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const confetti = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
    color: ['#F84464', '#22C55E', '#3B82F6', '#F59E0B'][Math.floor(Math.random() * 4)]
  }))

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map(item => (
            <div
              key={item.id}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: item.left,
                top: '-10px',
                backgroundColor: item.color,
                animationDelay: item.delay,
                animationDuration: item.duration
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Success Card */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#F84464] to-[#E03454] p-6 text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-white/90">Your tickets have been booked successfully</p>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-[#666666] mb-1">Booking ID</p>
              <p className="text-lg font-bold text-[#222222]">{currentBooking.id}</p>
            </div>

            <div className="border-t border-[#E5E5E5] pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-[#F84464] mt-0.5" />
                <div>
                  <p className="font-medium text-[#222222]">
                    {currentBooking.match.team1Short} vs {currentBooking.match.team2Short}
                  </p>
                  <p className="text-sm text-[#666666]">{formatDate(currentBooking.match.date)} • {currentBooking.match.time}</p>
                  <p className="text-sm text-[#666666]">{currentBooking.match.stadium}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F84464]/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-[#F84464] font-medium">#</span>
                </div>
                <div>
                  <p className="font-medium text-[#222222]">{currentBooking.seats.length} Seats</p>
                  <p className="text-sm text-[#666666]">
                    {currentBooking.seats.map(s => `${s.row}${s.number}`).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F84464]/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-[#F84464] font-medium">₹</span>
                </div>
                <div>
                  <p className="font-medium text-[#222222]">Total Paid</p>
                  <p className="text-sm text-[#666666]">₹{currentBooking.finalTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-[#F84464] text-white font-medium rounded-md hover:bg-[#E03454] transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Ticket
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGoHome}
                  className="flex-1 py-3 bg-white text-[#222222] font-medium rounded-md border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => alert('Share feature coming soon!')}
                  className="flex-1 py-3 bg-white text-[#222222] font-medium rounded-md border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="mt-5 bg-white rounded-lg border border-[#E5E5E5] p-4">
          <h4 className="font-medium text-[#222222] mb-3 text-sm">Important Information</h4>
          <ul className="space-y-2 text-sm text-[#666666]">
            <li>• Please arrive at least 1 hour before the event</li>
            <li>• Carry a valid ID proof along with your ticket</li>
            <li>• Entry gates close 30 minutes after event start</li>
            <li>• For help, contact support@ticketnest.com</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
