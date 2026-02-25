import { useState } from 'react'
import { useAppContext } from '../App'
import { ArrowLeft, CreditCard, CheckCircle, Shield, QrCode, X, Smartphone } from 'lucide-react'

const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: QrCode, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'credit', name: 'Credit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'debit', name: 'Debit Card', icon: CreditCard, description: 'All major banks' },
  { id: 'netbanking', name: 'Net Banking', icon: Shield, description: '50+ banks supported' }
]

const upiApps = [
  { 
    id: 'gpay', 
    name: 'Google Pay', 
    color: '#4285F4',
    scheme: 'tez://upi/pay',
    package: 'com.google.android.apps.nbu.paisa.user'
  },
  { 
    id: 'phonepe', 
    name: 'PhonePe', 
    color: '#5F259F',
    scheme: 'phonepe://pay',
    package: 'com.phonepe.app'
  },
  { 
    id: 'paytm', 
    name: 'Paytm', 
    color: '#00B9F5',
    scheme: 'paytmmp://pay',
    package: 'net.one97.paytm'
  },
  { 
    id: 'cred', 
    name: 'CRED', 
    color: '#1C1C1C',
    scheme: 'cred://pay',
    package: 'com.dream11.android.app'
  },
  { 
    id: 'amazonpay', 
    name: 'Amazon Pay', 
    color: '#FF9900',
    scheme: 'amazonpay://pay',
    package: 'in.amazon.mShop.android.shopping'
  },
  { 
    id: 'bhim', 
    name: 'BHIM', 
    color: '#004884',
    scheme: 'bhim://upi/pay',
    package: 'in.org.npci.upiapp'
  }
]

export default function CheckoutPage() {
  const { selectedMatch, selectedSeats, setCurrentView, addBooking, clearSeatSelection } = useAppContext()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', upiId: '' })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})
  const [showUpiModal, setShowUpiModal] = useState(false)
  const [selectedUpiApp, setSelectedUpiApp] = useState(null)

  if (!selectedMatch || selectedSeats.length === 0) {
    setCurrentView('home')
    return null
  }

  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const convenienceFee = Math.round(subtotal * 0.05)
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + convenienceFee + gst

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }
    if (paymentMethod === 'upi' && !formData.upiId.trim()) {
      newErrors.upiId = 'UPI ID is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (paymentMethod === 'upi') {
      setShowUpiModal(true)
    } else {
      handleOtherPayment()
    }
  }

  const handleOtherPayment = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    completeBooking()
  }

  const completeBooking = () => {
    const booking = {
      id: `TN${Date.now()}`,
      matchId: selectedMatch.id,
      match: selectedMatch,
      seats: selectedSeats,
      totalPrice: subtotal,
      convenienceFee,
      gst,
      finalTotal: total,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      paymentMethod: paymentMethod === 'upi' ? `UPI (${selectedUpiApp?.name || 'Default'})` : paymentMethod,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    }

    addBooking(booking)
    clearSeatSelection()
    setIsProcessing(false)
    setShowUpiModal(false)
    setCurrentView('confirmation')
  }

  const launchUpiApp = (app) => {
    setSelectedUpiApp(app)
    
    // Generate UPI payment URL
    // Using a demo merchant UPI ID - in production, this should be your actual merchant UPI
    const merchantUpiId = 'ticketnest@upi'
    const merchantName = 'TicketNest'
    const transactionNote = `IPL Tickets - ${selectedMatch.team1Short} vs ${selectedMatch.team2Short}`
    const amount = total.toFixed(2)
    const transactionId = `TN${Date.now()}`
    
    // Build UPI URL with the app's scheme
    const upiUrl = `${app.scheme}?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&cu=INR`
    
    // For mobile, try to open the app
    window.location.href = upiUrl
    
    // Also try the standard UPI fallback
    setTimeout(() => {
      const standardUpiUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&cu=INR`
      
      // Check if we're still on the page (app didn't open)
      if (document.visibilityState === 'visible') {
        window.location.href = standardUpiUrl
      }
    }, 500)
  }

  const handleUpiPaymentComplete = () => {
    // This simulates successful payment completion
    // In a real app, you'd verify the payment status from your backend
    setIsProcessing(true)
    setTimeout(() => {
      completeBooking()
    }, 1500)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => setCurrentView('seat-selection')}
            className="flex items-center gap-2 text-[#666666] hover:text-[#222222] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Seat Selection</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handlePayment} className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Event Details */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedMatch.image}
                    alt="Match"
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#222222] mb-2">
                      {selectedMatch.team1} vs {selectedMatch.team2}
                    </h2>
                    <div className="space-y-1 text-sm text-[#666666]">
                      <p>{selectedMatch.stadium}</p>
                      <p>{new Date(selectedMatch.date).toLocaleDateString()} • {selectedMatch.time}</p>
                      <p>{selectedSeats.length} seats</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Details */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F5F5F5]">
                <h3 className="font-medium text-[#222222]">Contact Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-[#666666] mb-2">
                    Full Name <span className="text-[#F84464]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-[#222222] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all duration-200 ${errors.name ? 'border-[#F84464]' : 'border-[#E5E5E5]'}`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-[#F84464]">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-[#666666] mb-2">
                    Email <span className="text-[#F84464]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-[#222222] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all duration-200 ${errors.email ? 'border-[#F84464]' : 'border-[#E5E5E5]'}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-[#F84464]">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm text-[#666666] mb-2">
                    Phone <span className="text-[#F84464]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-[#222222] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/10 transition-all duration-200 ${errors.phone ? 'border-[#F84464]' : 'border-[#E5E5E5]'}`}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-[#F84464]">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method - Full Width */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F5F5F5]">
              <h3 className="font-medium text-[#222222]">Payment Method</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {paymentMethods.map(method => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.id
                  return (
                    <div key={method.id}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 text-left ${
                          isSelected ? 'border-[#F84464] bg-[#F84464]/5' : 'border-[#E5E5E5] hover:border-[#D5D5D5] bg-white'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#F84464] text-white' : 'bg-[#F5F5F5] text-[#666666]'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#222222]">{method.name}</div>
                          <div className="text-sm text-[#999999]">{method.description}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#F84464]' : 'border-[#E5E5E5]'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#F84464]" />}
                        </div>
                      </button>
                      
                      {isSelected && method.id === 'upi' && (
                        <div className="mt-3 ml-16">
                          <input
                            type="text"
                            value={formData.upiId}
                            onChange={(e) => handleInputChange('upiId', e.target.value)}
                            placeholder="yourname@upi"
                            className={`w-full max-w-sm px-4 py-3 bg-white border rounded-lg text-[#222222] text-sm placeholder:text-[#999999] focus:outline-none focus:border-[#F84464] transition-all duration-200 ${errors.upiId ? 'border-[#F84464]' : 'border-[#E5E5E5]'}`}
                          />
                          {errors.upiId && <p className="mt-1 text-xs text-[#F84464]">{errors.upiId}</p>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Price Summary - Full Width */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F5F5F5]">
              <h3 className="font-medium text-[#222222]">Price Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Subtotal ({selectedSeats.length} seats)</span>
                  <span className="text-[#222222]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Convenience Fee</span>
                  <span className="text-[#222222]">₹{convenienceFee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">GST (18%)</span>
                  <span className="text-[#222222]">₹{gst.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold text-[#222222] text-lg">Total Amount</span>
                  <span className="font-bold text-[#F84464] text-2xl">₹{total.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-[#999999] mb-6">
                  <Shield className="w-4 h-4 text-green-500" />
                  <p>Your payment is secured with 256-bit encryption</p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#F84464] text-white font-semibold rounded-lg hover:bg-[#E03454] transition-colors active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{total.toLocaleString()}
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-[#999999] mt-4">
                  By clicking Pay, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* UPI App Selection Modal - Keep existing modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#222222]">Pay with UPI</h3>
                <p className="text-sm text-[#666666]">Select your payment app</p>
              </div>
              <button
                onClick={() => setShowUpiModal(false)}
                className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#666666]" />
              </button>
            </div>

            {/* Amount Display */}
            <div className="px-6 py-4 bg-[#F5F5F5]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#666666]">Total Amount</span>
                <span className="text-2xl font-bold text-[#F84464]">₹{total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-[#999999] mt-1">
                {selectedMatch.team1Short} vs {selectedMatch.team2Short} • {selectedSeats.length} seats
              </p>
            </div>

            {/* UPI Apps Grid */}
            <div className="p-6">
              <p className="text-sm font-medium text-[#222222] mb-4">Choose UPI App</p>
              <div className="grid grid-cols-3 gap-4">
                {upiApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => launchUpiApp(app)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E5E5E5] hover:border-[#F84464] hover:shadow-md transition-all duration-200 active:scale-95"
                    style={{ '--app-color': app.color }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-[#222222] text-center">{app.name}</span>
                  </button>
                ))}
              </div>

              {/* Other UPI Apps Option */}
              <button
                onClick={() => {
                  const standardUpiUrl = `upi://pay?pa=${encodeURIComponent('ticketnest@upi')}&pn=${encodeURIComponent('TicketNest')}&am=${total.toFixed(2)}&tn=${encodeURIComponent(`IPL Tickets - ${selectedMatch.team1Short} vs ${selectedMatch.team2Short}`)}&tr=TN${Date.now()}&cu=INR`
                  window.location.href = standardUpiUrl
                }}
                className="w-full mt-4 p-4 rounded-xl border border-[#E5E5E5] hover:border-[#F84464] hover:bg-[#F5F5F5] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5 text-[#666666]" />
                <span className="text-sm font-medium text-[#222222]">Other UPI Apps</span>
              </button>
            </div>

            {/* Payment Confirmation (for demo) */}
            <div className="px-6 pb-6">
              <div className="border-t border-[#E5E5E5] pt-4">
                <p className="text-xs text-[#666666] text-center mb-3">
                  After completing payment in your UPI app, click below
                </p>
                <button
                  onClick={handleUpiPaymentComplete}
                  disabled={isProcessing}
                  className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      I have completed payment
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="px-6 pb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> You will be redirected to your selected UPI app. 
                  The amount will be pre-filled. Complete the payment and return here to confirm.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
