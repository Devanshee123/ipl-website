import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Booking from '../models/Booking.js'
import Match from '../models/Match.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Create booking (Allow guest bookings)
router.post('/', async (req, res) => {
  try {
    const { matchId, seats, paymentMethod, totalPrice, convenienceFee, gst, finalTotal, guestEmail, guestPhone } = req.body
    
    const match = await Match.findById(matchId)
    if (!match) {
      return res.status(404).json({ message: 'Match not found' })
    }
    
    // Create booking - for guest users, use guest info
    const bookingData = {
      bookingId: `TN${Date.now()}`,
      match: matchId,
      seats,
      totalPrice,
      convenienceFee,
      gst,
      finalTotal,
      paymentMethod,
      paymentStatus: 'completed',
      status: 'confirmed'
    }
    
    // If user is logged in, add user ID, otherwise mark as guest booking
    if (req.user && req.user.id) {
      bookingData.user = req.user.id
    } else {
      bookingData.guestEmail = guestEmail
      bookingData.guestPhone = guestPhone
      bookingData.isGuestBooking = true
    }
    
    const booking = await Booking.create(bookingData)
    
    // Mark seats as booked
    for (const seat of seats) {
      const category = match.categories.find(c => c.name === seat.category)
      if (category) {
        const seatInCategory = category.seats.find(
          s => s.row === seat.row && s.number === seat.number
        )
        if (seatInCategory) {
          seatInCategory.status = 'booked'
          seatInCategory.bookedBy = req.user?.id || 'guest'
          seatInCategory.bookingTime = new Date()
        }
      }
    }
    match.bookedSeats = (match.bookedSeats || 0) + seats.length
    match.availableSeats = (match.availableSeats || 0) - seats.length
    await match.save()
    
    res.status(201).json(booking)
  } catch (error) {
    console.error('Booking error:', error)
    res.status(500).json({ message: error.message })
  }
})

// Get user's bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('match')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all bookings (Allow public access for data sync)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('match')
      .sort({ createdAt: -1 })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('match')
      .populate('user', 'name email phone')
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    
    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Confirm payment
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const { transactionId, upiApp } = req.body
    
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    booking.paymentStatus = 'completed'
    booking.paymentDetails = {
      transactionId,
      upiApp,
      paidAt: new Date()
    }
    await booking.save()
    
    // Update match seats to booked
    const match = await Match.findById(booking.match)
    for (const seat of booking.seats) {
      const category = match.categories.find(c => c.name === seat.category)
      const seatInCategory = category.seats.find(
        s => s.row === seat.row && s.number === seat.number
      )
      seatInCategory.status = 'booked'
      seatInCategory.bookedBy = req.user.id
    }
    match.bookedSeats += booking.seats.length
    match.availableSeats -= booking.seats.length
    await match.save()
    
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Cancel booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    
    if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' })
    }
    
    // Free up seats
    const match = await Match.findById(booking.match)
    for (const seat of booking.seats) {
      const category = match.categories.find(c => c.name === seat.category)
      const seatInCategory = category.seats.find(
        s => s.row === seat.row && s.number === seat.number
      )
      seatInCategory.status = 'available'
      seatInCategory.bookedBy = null
      seatInCategory.bookingTime = null
    }
    match.bookedSeats -= booking.seats.length
    match.availableSeats += booking.seats.length
    await match.save()
    
    booking.status = 'cancelled'
    await booking.save()
    
    res.json({ message: 'Booking cancelled successfully', booking })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
