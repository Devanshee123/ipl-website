import { useState, useRef } from 'react'
import { useAppContext } from '../App'
import { matchAPI } from '../services/api'
import { 
  ArrowLeft, Calendar, DollarSign, Users, Ticket, Search, Trash2, Edit, Plus, 
  LayoutDashboard, CreditCard, X, Upload, Image as ImageIcon, Save, MapPin, Clock,
  Download, User, Phone, Mail, CheckCircle
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function AdminPanel() {
  const { matches, setMatches, bookings, setCurrentView } = useAppContext()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    team1Short: '',
    team2Short: '',
    date: '',
    time: '7:30 PM',
    stadium: '',
    city: '',
    startingPrice: '',
    image: '',
    platinumPrice: '',
    platinumRows: '',
    platinumSeatsPerRow: '',
    goldPrice: '',
    goldRows: '',
    goldSeatsPerRow: '',
    silverPrice: '',
    silverRows: '',
    silverSeatsPerRow: '',
    generalPrice: '',
    generalRows: '',
    generalSeatsPerRow: ''
  })

  const totalRevenue = bookings.reduce((sum, b) => sum + b.finalTotal, 0)
  const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0)
  const totalBookings = bookings.length

  const filteredMatches = matches.filter(match =>
    match.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.stadium.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenModal = (match = null) => {
    if (match) {
      setEditingMatch(match)
      setFormData({
        team1: match.team1,
        team2: match.team2,
        team1Short: match.team1Short,
        team2Short: match.team2Short,
        date: match.date,
        time: match.time,
        stadium: match.stadium,
        city: match.city,
        startingPrice: match.startingPrice,
        image: match.image,
        platinumPrice: match.categories[0]?.price || '',
        platinumRows: match.categories[0]?.rows || '',
        platinumSeatsPerRow: match.categories[0]?.seatsPerRow || '',
        goldPrice: match.categories[1]?.price || '',
        goldRows: match.categories[1]?.rows || '',
        goldSeatsPerRow: match.categories[1]?.seatsPerRow || '',
        silverPrice: match.categories[2]?.price || '',
        silverRows: match.categories[2]?.rows || '',
        silverSeatsPerRow: match.categories[2]?.seatsPerRow || '',
        generalPrice: match.categories[3]?.price || '',
        generalRows: match.categories[3]?.rows || '',
        generalSeatsPerRow: match.categories[3]?.seatsPerRow || ''
      })
      setPreviewImage(match.image)
    } else {
      setEditingMatch(null)
      setFormData({
        team1: '',
        team2: '',
        team1Short: '',
        team2Short: '',
        date: '',
        time: '7:30 PM',
        stadium: '',
        city: '',
        startingPrice: '',
        image: '',
        platinumPrice: '',
        platinumRows: '',
        platinumSeatsPerRow: '',
        goldPrice: '',
        goldRows: '',
        goldSeatsPerRow: '',
        silverPrice: '',
        silverRows: '',
        silverSeatsPerRow: '',
        generalPrice: '',
        generalRows: '',
        generalSeatsPerRow: ''
      })
      setPreviewImage(null)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMatch(null)
    setPreviewImage(null)
    setApiError(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
      setFormData(prev => ({ ...prev, imageFile: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setApiError(null)
    
    const categories = [
      { name: 'Platinum', price: Number(formData.platinumPrice) || 8000, rows: Number(formData.platinumRows) || 5, seatsPerRow: Number(formData.platinumSeatsPerRow) || 20 },
      { name: 'Gold', price: Number(formData.goldPrice) || 5000, rows: Number(formData.goldRows) || 8, seatsPerRow: Number(formData.goldSeatsPerRow) || 25 },
      { name: 'Silver', price: Number(formData.silverPrice) || 3000, rows: Number(formData.silverRows) || 10, seatsPerRow: Number(formData.silverSeatsPerRow) || 30 },
      { name: 'General', price: Number(formData.generalPrice) || 1500, rows: Number(formData.generalRows) || 15, seatsPerRow: Number(formData.generalSeatsPerRow) || 40 }
    ]

    const matchData = {
      team1: formData.team1,
      team2: formData.team2,
      team1Short: formData.team1Short,
      team2Short: formData.team2Short,
      date: formData.date,
      time: formData.time,
      stadium: formData.stadium,
      city: formData.city,
      startingPrice: Number(formData.startingPrice) || 1500,
      image: previewImage || formData.image || '/images/match-mi-csk.jpg',
      categories
    }

    try {
      if (editingMatch) {
        const updated = await matchAPI.update(editingMatch._id, matchData)
        setMatches(prev => prev.map(m => m._id === editingMatch._id ? updated : m))
      } else {
        const created = await matchAPI.create(matchData)
        setMatches(prev => [...prev, created])
      }
      handleCloseModal()
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMatch = async (matchId) => {
    if (confirm('Are you sure you want to delete this match?')) {
      try {
        await matchAPI.delete(matchId)
        setMatches(prev => prev.filter(m => m._id !== matchId))
      } catch (err) {
        alert('Failed to delete: ' + err.message)
      }
    }
  }

  const renderModal = () => {
    if (!showModal) return null

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#222222]">
              {editingMatch ? 'Edit Event' : 'Add New Event'}
            </h2>
            <button onClick={handleCloseModal} className="p-2 hover:bg-[#F5F5F5] rounded-full">
              <X className="w-5 h-5 text-[#666666]" />
            </button>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-600">❌ {apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-2">Event Image</label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-24 bg-[#F5F5F5] rounded-lg overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-[#999999]" />
                    </div>
                  )}
                </div>
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[#F84464] text-white text-sm font-medium rounded-md hover:bg-[#E03454] transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                  <p className="text-xs text-[#999999] mt-1">Or use S3 URL below</p>
                </div>
              </div>
              <input type="text" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://your-s3-bucket.com/image.jpg" className="mt-2 w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
            </div>

            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">Team 1 Name</label>
                <input type="text" name="team1" value={formData.team1} onChange={handleInputChange} placeholder="e.g., Mumbai Indians" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">Team 1 Short</label>
                <input type="text" name="team1Short" value={formData.team1Short} onChange={handleInputChange} placeholder="e.g., MI" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">Team 2 Name</label>
                <input type="text" name="team2" value={formData.team2} onChange={handleInputChange} placeholder="e.g., Chennai Super Kings" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">Team 2 Short</label>
                <input type="text" name="team2Short" value={formData.team2Short} onChange={handleInputChange} placeholder="e.g., CSK" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1"><Calendar className="w-4 h-4 inline mr-1" />Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1"><Clock className="w-4 h-4 inline mr-1" />Time</label>
                <input type="text" name="time" value={formData.time} onChange={handleInputChange} placeholder="e.g., 7:30 PM" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">Starting Price</label>
                <input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleInputChange} placeholder="e.g., 1500" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
            </div>

            {/* Stadium & City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1"><MapPin className="w-4 h-4 inline mr-1" />Stadium</label>
                <input type="text" name="stadium" value={formData.stadium} onChange={handleInputChange} placeholder="e.g., Wankhede Stadium" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., Mumbai" className="w-full px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" required />
              </div>
            </div>

            {/* Ticket Categories */}
            <div>
              <h3 className="text-lg font-medium text-[#222222] mb-4">Ticket Categories</h3>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-700 mb-3">Platinum</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" name="platinumPrice" value={formData.platinumPrice} onChange={handleInputChange} placeholder="Price (₹)" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="platinumRows" value={formData.platinumRows} onChange={handleInputChange} placeholder="Rows" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="platinumSeatsPerRow" value={formData.platinumSeatsPerRow} onChange={handleInputChange} placeholder="Seats per row" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-700 mb-3">Gold</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" name="goldPrice" value={formData.goldPrice} onChange={handleInputChange} placeholder="Price (₹)" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="goldRows" value={formData.goldRows} onChange={handleInputChange} placeholder="Rows" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="goldSeatsPerRow" value={formData.goldSeatsPerRow} onChange={handleInputChange} placeholder="Seats per row" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Silver</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" name="silverPrice" value={formData.silverPrice} onChange={handleInputChange} placeholder="Price (₹)" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="silverRows" value={formData.silverRows} onChange={handleInputChange} placeholder="Rows" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="silverSeatsPerRow" value={formData.silverSeatsPerRow} onChange={handleInputChange} placeholder="Seats per row" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-700 mb-3">General</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" name="generalPrice" value={formData.generalPrice} onChange={handleInputChange} placeholder="Price (₹)" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="generalRows" value={formData.generalRows} onChange={handleInputChange} placeholder="Rows" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                    <input type="number" name="generalSeatsPerRow" value={formData.generalSeatsPerRow} onChange={handleInputChange} placeholder="Seats per row" className="px-3 py-2 border border-[#E5E5E5] rounded-md text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E5E5]">
              <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 border border-[#E5E5E5] text-[#666666] font-medium rounded-md hover:bg-[#F5F5F5] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#F84464] text-white font-medium rounded-md hover:bg-[#E03454] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : editingMatch ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const downloadTicket = async (booking) => {
    // Create a temporary div for the ticket
    const ticketDiv = document.createElement('div')
    ticketDiv.style.width = '400px'
    ticketDiv.style.background = 'white'
    ticketDiv.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    ticketDiv.innerHTML = `
      <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #F84464 0%, #8B5CF6 100%); color: white; padding: 24px; text-align: center;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0;">🏟️ TICKETNEST</h1>
          <p style="font-size: 12px; margin: 4px 0 0 0; opacity: 0.9;">Official Match Ticket</p>
        </div>
        
        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px dashed #E5E5E5;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
              <span style="font-size: 16px; font-weight: bold; color: #222;">${booking.match.team1Short}</span>
              <span style="font-size: 12px; color: #F84464; font-weight: bold;">VS</span>
              <span style="font-size: 16px; font-weight: bold; color: #222;">${booking.match.team2Short}</span>
            </div>
            <p style="font-size: 11px; color: #666; margin: 4px 0;">${booking.match.stadium}</p>
            <p style="font-size: 11px; color: #666; margin: 4px 0;">${new Date(booking.match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="font-size: 11px; color: #666; margin: 4px 0;">${booking.match.time}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 10px; color: #999; text-transform: uppercase; margin: 0 0 4px 0;">Customer Name</p>
            <p style="font-size: 13px; color: #222; font-weight: 500; margin: 0;">${booking.customerName}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 10px; color: #999; text-transform: uppercase; margin: 0 0 4px 0;">Contact</p>
            <p style="font-size: 11px; color: #666; margin: 0;">${booking.customerPhone} • ${booking.customerEmail}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 10px; color: #999; text-transform: uppercase; margin: 0 0 4px 0;">Selected Seats (${booking.seats.length})</p>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${booking.seats.map(seat => `
                <span style="background: #F5F5F5; padding: 4px 8px; border-radius: 4px; font-size: 10px; color: #222;">${seat.section}-R${seat.row}-S${seat.seat}</span>
              `).join('')}
            </div>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 10px; color: #999; text-transform: uppercase; margin: 0 0 4px 0;">Payment Method</p>
            <p style="font-size: 11px; color: #222; font-weight: 500; margin: 0;">${booking.paymentMethod}</p>
          </div>
          
          <div style="background: #F8F9FA; border-radius: 8px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #666;">
              <span>Subtotal (${booking.seats.length} tickets)</span>
              <span>₹${booking.totalPrice.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #666;">
              <span>Convenience Fee</span>
              <span>₹${booking.convenienceFee.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #666;">
              <span>GST (18%)</span>
              <span>₹${booking.gst.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #F84464; border-top: 1px solid #E5E5E5; padding-top: 8px; margin-top: 8px;">
              <span>Total Paid</span>
              <span>₹${booking.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div style="height: 30px; background: repeating-linear-gradient(90deg, #222 0px, #222 2px, transparent 2px, transparent 4px); margin: 8px 30px;"></div>
        
        <div style="text-align: center; padding: 16px; background: #F8F9FA;">
          <div style="width: 100px; height: 100px; background: white; border: 2px solid #E5E5E5; border-radius: 8px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 100 100" width="80" height="80">
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
            </svg>
          </div>
          <p style="font-size: 10px; color: #666; font-family: monospace; margin: 0;">${booking.id}</p>
        </div>
        
        <div style="text-align: center; padding: 12px; background: white; border-top: 1px solid #E5E5E5;">
          <p style="font-size: 9px; color: #999; margin: 0;">Thank you for booking with TicketNest!</p>
          <p style="font-size: 9px; color: #999; margin: 4px 0 0 0;">Please arrive 1 hour before the match</p>
        </div>
      </div>
    `
    
    // Append to body temporarily
    ticketDiv.style.position = 'absolute'
    ticketDiv.style.left = '-9999px'
    document.body.appendChild(ticketDiv)
    
    try {
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(ticketDiv, {
        scale: 2,
        useCORS: true,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Ticket-${booking.id}.pdf`)
      
      // Show success message
      alert('Ticket downloaded successfully!')
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to download ticket. Please try again.')
    } finally {
      // Clean up
      document.body.removeChild(ticketDiv)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: matches.length, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Total Bookings', value: totalBookings, icon: Ticket, color: 'bg-green-500' },
          { label: 'Tickets Sold', value: totalTickets, icon: Users, color: 'bg-purple-500' },
          { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'bg-[#F84464]' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-[#E5E5E5] p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-[#666666]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#222222]">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Detailed Recent Bookings */}
      <div className="bg-white rounded-lg border border-[#E5E5E5]">
        <div className="px-4 py-3 border-b border-[#E5E5E5] flex items-center justify-between">
          <h3 className="font-medium text-[#222222]">Recent Bookings</h3>
          <button 
            onClick={() => setActiveTab('bookings')}
            className="text-sm text-[#F84464] hover:underline"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {bookings.slice(-5).reverse().map(booking => (
            <div key={booking.id} className="px-4 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-[#222222]">{booking.id}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{booking.status}</span>
                  </div>
                  <p className="text-sm text-[#666666] mb-2">
                    {booking.match.team1Short} vs {booking.match.team2Short} • {booking.seats.length} seats
                  </p>
                  {/* Customer Details */}
                  <div className="flex items-center gap-4 text-xs text-[#999999]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {booking.customerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {booking.customerPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {booking.customerEmail}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-[#222222]">₹{booking.finalTotal.toLocaleString()}</p>
                  <p className="text-xs text-[#999999] mt-1">{booking.paymentMethod}</p>
                  <button 
                    onClick={() => downloadTicket(booking)}
                    className="mt-2 text-xs flex items-center gap-1 text-[#F84464] hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="px-4 py-8 text-center text-[#999999]">
              No bookings yet
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderEvents = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-md text-sm" />
        </div>
        <button onClick={() => handleOpenModal()} className="ml-4 px-4 py-2.5 bg-[#F84464] text-white text-sm font-medium rounded-md hover:bg-[#E03454] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* CARDS LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map(match => (
          <div key={match._id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
            <div className="h-32 bg-[#F5F5F5] relative">
              <img src={match.image} alt={`${match.team1} vs ${match.team2}`} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => handleOpenModal(match)} className="p-1.5 bg-white/90 rounded-md hover:bg-white text-[#666666] hover:text-[#F84464] transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteMatch(match._id)} className="p-1.5 bg-white/90 rounded-md hover:bg-white text-[#666666] hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-[#222222]">{match.team1Short}</span>
                <span className="text-[#999999]">vs</span>
                <span className="font-bold text-[#222222]">{match.team2Short}</span>
              </div>
              <p className="text-sm text-[#666666] mb-1">{match.stadium}</p>
              <p className="text-sm text-[#666666]">{formatDate(match.date)} • {match.time}</p>
              <p className="text-[#F84464] font-medium mt-2">₹{match.startingPrice.toLocaleString()}+</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-8 text-center text-[#999999]">
          <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No bookings yet</p>
        </div>
      ) : (
        bookings.slice().reverse().map(booking => (
          <div key={booking.id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
            {/* Booking Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F84464]/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-[#F84464]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#222222]">{booking.id}</p>
                    <p className="text-xs text-[#999999]">
                      {new Date(booking.bookingDate).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Booking Body */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Match Details */}
                <div>
                  <h4 className="text-sm font-medium text-[#666666] mb-3 uppercase tracking-wide">Match Details</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={booking.match.image} 
                      alt="Match" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold text-[#222222]">
                        {booking.match.team1Short} vs {booking.match.team2Short}
                      </p>
                      <p className="text-sm text-[#666666]">{booking.match.stadium}</p>
                      <p className="text-sm text-[#666666]">
                        {new Date(booking.match.date).toLocaleDateString()} • {booking.match.time}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Customer Details */}
                <div>
                  <h4 className="text-sm font-medium text-[#666666] mb-3 uppercase tracking-wide">Customer Details</h4>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-[#999999]" />
                      <span className="text-[#222222] font-medium">{booking.customerName}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-[#999999]" />
                      <span className="text-[#666666]">{booking.customerEmail}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-[#999999]" />
                      <span className="text-[#666666]">{booking.customerPhone}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Seats & Payment */}
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seats */}
                  <div>
                    <h4 className="text-sm font-medium text-[#666666] mb-3 uppercase tracking-wide">
                      Selected Seats ({booking.seats.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.seats.map((seat, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 bg-[#F5F5F5] rounded-lg text-sm text-[#222222] font-medium"
                        >
                          {seat.section}-R{seat.row}-S{seat.seat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Payment Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-[#666666] mb-3 uppercase tracking-wide">Payment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[#666666]">
                        <span>Subtotal ({booking.seats.length} tickets)</span>
                        <span>₹{booking.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>Convenience Fee</span>
                        <span>₹{booking.convenienceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#666666]">
                        <span>GST (18%)</span>
                        <span>₹{booking.gst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#E5E5E5]">
                        <span className="font-bold text-[#222222]">Total Paid</span>
                        <span className="font-bold text-[#F84464] text-lg">₹{booking.finalTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#999999] text-xs">
                        <span>Payment Method</span>
                        <span>{booking.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download Button */}
              <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex justify-end">
                <button 
                  onClick={() => downloadTicket(booking)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#F84464] text-white font-medium rounded-lg hover:bg-[#E03454] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Ticket
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-[#666666] hover:text-[#222222] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Home</span>
              </button>
              <h1 className="text-xl font-bold text-[#222222] hidden sm:block">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-lg border border-[#E5E5E5] w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'bookings', label: 'Bookings', icon: CreditCard }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? 'bg-[#F84464] text-white' : 'text-[#666666] hover:text-[#222222] hover:bg-[#F5F5F5]'}`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'bookings' && renderBookings()}
        
        {renderModal()}
      </div>
    </div>
  )
}
