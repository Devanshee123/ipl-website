import { useState, useEffect } from 'react'
import { useAppContext } from '../App'
import { CheckCircle, Download, Share2, Home, Ticket } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

  const handleDownload = async () => {
    // Create a temporary container with proper styling
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    document.body.appendChild(container)
    
    // Create the ticket element with full HTML/CSS styling (like the original HTML download)
    const ticketWrapper = document.createElement('div')
    ticketWrapper.style.width = '400px'
    ticketWrapper.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    ticketWrapper.style.padding = '20px'
    ticketWrapper.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    ticketWrapper.style.minHeight = '100vh'
    ticketWrapper.style.display = 'flex'
    ticketWrapper.style.alignItems = 'center'
    ticketWrapper.style.justifyContent = 'center'
    
    ticketWrapper.innerHTML = `
      <div style="
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 400px;
        width: 100%;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #F84464 0%, #8B5CF6 100%);
          color: white;
          padding: 24px;
          text-align: center;
        ">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 4px 0;">🏟️ TICKETNEST</h1>
          <p style="font-size: 14px; margin: 0; opacity: 0.9;">Official Match Ticket</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 24px;">
          <!-- Match Info -->
          <div style="
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #E5E5E5;
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-bottom: 12px;
            ">
              <div style="text-align: center;">
                <div style="font-size: 18px; font-weight: bold; color: #222;">${currentBooking.match.team1Short}</div>
              </div>
              <div style="font-size: 14px; color: #F84464; font-weight: bold;">VS</div>
              <div style="text-align: center;">
                <div style="font-size: 18px; font-weight: bold; color: #222;">${currentBooking.match.team2Short}</div>
              </div>
            </div>
            <div style="font-size: 13px; color: #666; line-height: 1.6;">
              ${currentBooking.match.stadium}<br>
              ${formatDate(currentBooking.match.date)}<br>
              ${currentBooking.match.time}
            </div>
          </div>
          
          <!-- Customer Info -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Customer Name</div>
            <div style="font-size: 14px; color: #222; font-weight: 500;">${currentBooking.customerName}</div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contact</div>
            <div style="font-size: 13px; color: #666;">${currentBooking.customerPhone} • ${currentBooking.customerEmail}</div>
          </div>
          
          <!-- Seats -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Selected Seats (${currentBooking.seats.length})</div>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
              gap: 8px;
            ">
              ${currentBooking.seats.map(seat => `
                <div style="
                  background: #F5F5F5;
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-size: 12px;
                  text-align: center;
                  color: #222;
                ">${seat.section || seat.category || 'Sec'}-R${seat.row}-S${seat.seat || seat.number}</div>
              `).join('')}
            </div>
          </div>
          
          <!-- Payment Method -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Payment Method</div>
            <div style="font-size: 14px; color: #222; font-weight: 500;">${currentBooking.paymentMethod}</div>
          </div>
          
          <!-- Price Section -->
          <div style="
            background: #F8F9FA;
            border-radius: 12px;
            padding: 16px;
            margin-top: 20px;
          ">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #666;">
              <span>Subtotal (${currentBooking.seats.length} tickets)</span>
              <span>₹${currentBooking.totalPrice.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #666;">
              <span>Convenience Fee</span>
              <span>₹${currentBooking.convenienceFee.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #666;">
              <span>GST (18%)</span>
              <span>₹${currentBooking.gst.toLocaleString()}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: bold;
              color: #F84464;
              border-top: 1px solid #E5E5E5;
              padding-top: 12px;
              margin-top: 12px;
            ">
              <span>Total Paid</span>
              <span>₹${currentBooking.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <!-- Barcode -->
        <div style="
          height: 40px;
          background: repeating-linear-gradient(
            90deg,
            #222 0px,
            #222 2px,
            transparent 2px,
            transparent 4px
          );
          margin: 12px 40px;
        "></div>
        
        <!-- QR Section -->
        <div style="text-align: center; padding: 20px; background: #F8F9FA;">
          <div style="
            width: 150px;
            height: 150px;
            background: white;
            border: 2px solid #E5E5E5;
            border-radius: 12px;
            margin: 0 auto 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg viewBox="0 0 100 100" width="120" height="120">
              <rect fill="white" width="100" height="100"/>
              <rect fill="#222" x="10" y="10" width="25" height="25"/>
              <rect fill="#222" x="65" y="10" width="25" height="25"/>
              <rect fill="#222" x="10" y="65" width="25" height="25"/>
              <rect fill="#222" x="40" y="40" width="5" height="5"/>
              <rect fill="#222" x="50" y="40" width="5" height="5"/>
              <rect fill="#222" x="40" y="50" width="5" height="5"/>
              <rect fill="#222" x="50" y="50" width="5" height="5"/>
              <rect fill="#222" x="60" y="60" width="5" height="5"/>
              <rect fill="#222" x="70" y="60" width="5" height="5"/>
              <rect fill="#222" x="60" y="70" width="5" height="5"/>
              <rect fill="#222" x="70" y="70" width="5" height="5"/>
              <rect fill="#222" x="40" y="20" width="5" height="5"/>
              <rect fill="#222" x="50" y="20" width="5" height="5"/>
              <rect fill="#222" x="40" y="30" width="5" height="5"/>
              <rect fill="#222" x="50" y="30" width="5" height="5"/>
              <rect fill="#222" x="20" y="40" width="5" height="5"/>
              <rect fill="#222" x="30" y="40" width="5" height="5"/>
              <rect fill="#222" x="20" y="50" width="5" height="5"/>
              <rect fill="#222" x="30" y="50" width="5" height="5"/>
            </svg>
          </div>
          <div style="font-size: 12px; color: #666; font-family: monospace;">${currentBooking.id}</div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 16px; font-size: 11px; color: #999; border-top: 1px solid #E5E5E5;">
          <p style="margin: 0;">Thank you for booking with TicketNest!</p>
          <p style="margin: 4px 0 0 0;">Please arrive 1 hour before the match • Carry valid ID proof</p>
        </div>
      </div>
    `
    
    container.appendChild(ticketWrapper)
    
    try {
      // Wait for fonts to load
      await document.fonts.ready
      
      // Generate high-quality canvas
      const canvas = await html2canvas(ticketWrapper, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        windowWidth: 440,
        windowHeight: ticketWrapper.scrollHeight
      })
      
      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Center the ticket on the page
      const xOffset = 0
      const yOffset = imgHeight > pageHeight ? 0 : (pageHeight - imgHeight) / 2
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, Math.min(imgHeight, pageHeight))
      pdf.save(`Ticket-${currentBooking.id}.pdf`)
      
      alert('Ticket downloaded successfully!')
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to download ticket. Please try again.')
    } finally {
      document.body.removeChild(container)
    }
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
