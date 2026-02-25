import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  isGuestBooking: { type: Boolean, default: false },
  guestEmail: { type: String, required: false },
  guestPhone: { type: String, required: false },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  seats: [{
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  convenienceFee: { type: Number, required: true },
  gst: { type: Number, required: true },
  finalTotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  paymentDetails: {
    transactionId: { type: String, default: null },
    upiApp: { type: String, default: null },
    paidAt: { type: Date, default: Date.now }
  },
  status: { type: String, enum: ['confirmed', 'cancelled', 'refunded'], default: 'confirmed' },
  qrCode: { type: String, default: null }
}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)
