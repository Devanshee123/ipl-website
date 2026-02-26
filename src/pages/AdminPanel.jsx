import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../App'
import { matchAPI, settingsAPI } from '../services/api'
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
    vipPrice: '',
    vipRows: '',
    vipSeatsPerRow: '',
    premiumPrice: '',
    premiumRows: '',
    premiumSeatsPerRow: '',
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

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    upiId: 'ticketnest@upi',
    upiName: 'TicketNest Payments'
  })
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(false)
  const [paymentSettingsError, setPaymentSettingsError] = useState(null)

  // Fetch payment settings on mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const settings = await settingsAPI.getPaymentSettings()
        setPaymentSettings({
          upiId: settings.upiId,
          upiName: settings.upiName
        })
      } catch (err) {
        console.error('Failed to fetch payment settings:', err)
      }
    }
    fetchPaymentSettings()
  }, [])

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
      // Find category index by name or default to empty
      const getCat = (name) => match.categories?.find(c => c.name === name) || {}
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
        // VIP (highest tier)
        vipPrice: getCat('VIP').price || '',
        vipRows: getCat('VIP').rows || '',
        vipSeatsPerRow: getCat('VIP').seatsPerRow || '',
        // Premium
        premiumPrice: getCat('Premium').price || '',
        premiumRows: getCat('Premium').rows || '',
        premiumSeatsPerRow: getCat('Premium').seatsPerRow || '',
        // Gold
        goldPrice: getCat('Gold').price || '',
        goldRows: getCat('Gold').rows || '',
        goldSeatsPerRow: getCat('Gold').seatsPerRow || '',
        // Silver
        silverPrice: getCat('Silver').price || '',
        silverRows: getCat('Silver').rows || '',
        silverSeatsPerRow: getCat('Silver').seatsPerRow || '',
        // General
        generalPrice: getCat('General').price || '',
        generalRows: getCat('General').rows || '',
        generalSeatsPerRow: getCat('General').seatsPerRow || ''
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
        vipPrice: '',
        vipRows: '',
        vipSeatsPerRow: '',
        premiumPrice: '',
        premiumRows: '',
        premiumSeatsPerRow: '',
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
      { name: 'VIP', price: Number(formData.vipPrice) || 10000, rows: Number(formData.vipRows) || 4, seatsPerRow: Number(formData.vipSeatsPerRow) || 15, color: '#8B5CF6' },
      { name: 'Premium', price: Number(formData.premiumPrice) || 7500, rows: Number(formData.premiumRows) || 6, seatsPerRow: Number(formData.premiumSeatsPerRow) || 20, color: '#F59E0B' },
      { name: 'Gold', price: Number(formData.goldPrice) || 5000, rows: Number(formData.goldRows) || 8, seatsPerRow: Number(formData.goldSeatsPerRow) || 25, color: '#EAB308' },
      { name: 'Silver', price: Number(formData.silverPrice) || 3500, rows: Number(formData.silverRows) || 10, seatsPerRow: Number(formData.silverSeatsPerRow) || 30, color: '#9CA3AF' },
      { name: 'General', price: Number(formData.generalPrice) || 1500, rows: Number(formData.generalRows) || 15, seatsPerRow: Number(formData.generalSeatsPerRow) || 40, color: '#22C55E' }
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

  // Handle payment settings update
  const handlePaymentSettingsUpdate = async (e) => {
    e.preventDefault()
    setPaymentSettingsLoading(true)
    setPaymentSettingsError(null)
    
    try {
      await settingsAPI.updatePaymentSettings({
        upiId: paymentSettings.upiId,
        upiName: paymentSettings.upiName
      })
      alert('Payment settings updated successfully!')
    } catch (err) {
      setPaymentSettingsError(err.message)
      alert('Failed to update: ' + err.message)
    } finally {
      setPaymentSettingsLoading(false)
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
                {/* VIP */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    VIP
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-purple-600 mb-1 block">Price (₹)</label>
                      <input type="number" name="vipPrice" value={formData.vipPrice} onChange={handleInputChange} placeholder="e.g., 10000" className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="text-xs text-purple-600 mb-1 block">Rows</label>
                      <input type="number" name="vipRows" value={formData.vipRows} onChange={handleInputChange} placeholder="e.g., 4" className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="text-xs text-purple-600 mb-1 block">Seats/Row</label>
                      <input type="number" name="vipSeatsPerRow" value={formData.vipSeatsPerRow} onChange={handleInputChange} placeholder="e.g., 15" className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
                
                {/* Premium */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    Premium
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-amber-600 mb-1 block">Price (₹)</label>
                      <input type="number" name="premiumPrice" value={formData.premiumPrice} onChange={handleInputChange} placeholder="e.g., 7500" className="w-full px-3 py-2 border border-amber-200 rounded-md text-sm focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="text-xs text-amber-600 mb-1 block">Rows</label>
                      <input type="number" name="premiumRows" value={formData.premiumRows} onChange={handleInputChange} placeholder="e.g., 6" className="w-full px-3 py-2 border border-amber-200 rounded-md text-sm focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="text-xs text-amber-600 mb-1 block">Seats/Row</label>
                      <input type="number" name="premiumSeatsPerRow" value={formData.premiumSeatsPerRow} onChange={handleInputChange} placeholder="e.g., 20" className="w-full px-3 py-2 border border-amber-200 rounded-md text-sm focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                </div>
                
                {/* Gold */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    Gold
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-yellow-600 mb-1 block">Price (₹)</label>
                      <input type="number" name="goldPrice" value={formData.goldPrice} onChange={handleInputChange} placeholder="e.g., 5000" className="w-full px-3 py-2 border border-yellow-200 rounded-md text-sm focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-600 mb-1 block">Rows</label>
                      <input type="number" name="goldRows" value={formData.goldRows} onChange={handleInputChange} placeholder="e.g., 8" className="w-full px-3 py-2 border border-yellow-200 rounded-md text-sm focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-600 mb-1 block">Seats/Row</label>
                      <input type="number" name="goldSeatsPerRow" value={formData.goldSeatsPerRow} onChange={handleInputChange} placeholder="e.g., 25" className="w-full px-3 py-2 border border-yellow-200 rounded-md text-sm focus:ring-2 focus:ring-yellow-500" />
                    </div>
                  </div>
                </div>
                
                {/* Silver */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                    Silver
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Price (₹)</label>
                      <input type="number" name="silverPrice" value={formData.silverPrice} onChange={handleInputChange} placeholder="e.g., 3500" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-gray-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Rows</label>
                      <input type="number" name="silverRows" value={formData.silverRows} onChange={handleInputChange} placeholder="e.g., 10" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-gray-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Seats/Row</label>
                      <input type="number" name="silverSeatsPerRow" value={formData.silverSeatsPerRow} onChange={handleInputChange} placeholder="e.g., 30" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-gray-500" />
                    </div>
                  </div>
                </div>
                
                {/* General */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    General
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-green-600 mb-1 block">Price (₹)</label>
                      <input type="number" name="generalPrice" value={formData.generalPrice} onChange={handleInputChange} placeholder="e.g., 1500" className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="text-xs text-green-600 mb-1 block">Rows</label>
                      <input type="number" name="generalRows" value={formData.generalRows} onChange={handleInputChange} placeholder="e.g., 15" className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="text-xs text-green-600 mb-1 block">Seats/Row</label>
                      <input type="number" name="generalSeatsPerRow" value={formData.generalSeatsPerRow} onChange={handleInputChange} placeholder="e.g., 40" className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:ring-2 focus:ring-green-500" />
                    </div>
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
                <div style="font-size: 18px; font-weight: bold; color: #222;">${booking.match.team1Short}</div>
              </div>
              <div style="font-size: 14px; color: #F84464; font-weight: bold;">VS</div>
              <div style="text-align: center;">
                <div style="font-size: 18px; font-weight: bold; color: #222;">${booking.match.team2Short}</div>
              </div>
            </div>
            <div style="font-size: 13px; color: #666; line-height: 1.6;">
              ${booking.match.stadium}<br>
              ${new Date(booking.match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
              ${booking.match.time}
            </div>
          </div>
          
          <!-- Customer Info -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Customer Name</div>
            <div style="font-size: 14px; color: #222; font-weight: 500;">${booking.customerName}</div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contact</div>
            <div style="font-size: 13px; color: #666;">${booking.customerPhone} • ${booking.customerEmail}</div>
          </div>
          
          <!-- Seats -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Selected Seats (${booking.seats.length})</div>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
              gap: 8px;
            ">
              ${booking.seats.map(seat => `
                <div style="
                  background: #F5F5F5;
                  padding: 6px 10px;
                  border-radius: 6px;
                  font-size: 12px;
                  text-align: center;
                  color: #222;
                ">${seat.section}-R${seat.row}-S${seat.seat}</div>
              `).join('')}
            </div>
          </div>
          
          <!-- Payment Method -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Payment Method</div>
            <div style="font-size: 14px; color: #222; font-weight: 500;">${booking.paymentMethod}</div>
          </div>
          
          <!-- Price Section -->
          <div style="
            background: #F8F9FA;
            border-radius: 12px;
            padding: 16px;
            margin-top: 20px;
          ">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #666;">
              <span>Subtotal (${booking.seats.length} tickets)</span>
              <span>₹${booking.totalPrice.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #666;">
              <span>Convenience Fee</span>
              <span>₹${booking.convenienceFee.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #666;">
              <span>GST (18%)</span>
              <span>₹${booking.gst.toLocaleString()}</span>
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
              <span>₹${booking.finalTotal.toLocaleString()}</span>
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
          <div style="font-size: 12px; color: #666; font-family: monospace;">${booking.id}</div>
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
      pdf.save(`Ticket-${booking.id}.pdf`)
      
      alert('Ticket downloaded successfully!')
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to download ticket. Please try again.')
    } finally {
      document.body.removeChild(container)
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

  const renderPaymentSettings = () => (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
        <h2 className="text-xl font-bold text-[#222222] mb-6">Payment Settings</h2>
        
        {paymentSettingsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">❌ {paymentSettingsError}</p>
          </div>
        )}
        
        <form onSubmit={handlePaymentSettingsUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#222222] mb-2">
              UPI ID (Where all payments will be received)
            </label>
            <input
              type="text"
              value={paymentSettings.upiId}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, upiId: e.target.value }))}
              placeholder="e.g., yourname@upi"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#F84464] focus:border-[#F84464]"
              required
            />
            <p className="text-xs text-[#999999] mt-1">
              All customer payments will be sent to this UPI ID
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#222222] mb-2">
              UPI Display Name
            </label>
            <input
              type="text"
              value={paymentSettings.upiName}
              onChange={(e) => setPaymentSettings(prev => ({ ...prev, upiName: e.target.value }))}
              placeholder="e.g., Your Business Name"
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#F84464] focus:border-[#F84464]"
              required
            />
            <p className="text-xs text-[#999999] mt-1">
              This name will be shown to customers during payment
            </p>
          </div>
          
          <div className="bg-[#F5F5F5] rounded-lg p-4">
            <h4 className="font-medium text-[#222222] mb-2">Current Settings Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#666666]">UPI ID:</span>
                <span className="font-medium text-[#222222]">{paymentSettings.upiId || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Display Name:</span>
                <span className="font-medium text-[#222222]">{paymentSettings.upiName || 'Not set'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-[#E5E5E5]">
            <button
              type="submit"
              disabled={paymentSettingsLoading}
              className="px-6 py-2.5 bg-[#F84464] text-white font-medium rounded-lg hover:bg-[#E03454] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {paymentSettingsLoading ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </div>
        </form>
      </div>
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
            { id: 'bookings', label: 'Bookings', icon: CreditCard },
            { id: 'payment', label: 'Payment Settings', icon: DollarSign }
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
        {activeTab === 'payment' && renderPaymentSettings()}
        
        {renderModal()}
      </div>
    </div>
  )
}
