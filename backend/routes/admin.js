import express from 'express'
import Match from '../models/Match.js'
import Booking from '../models/Booking.js'
import User from '../models/User.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Get dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalMatches = await Match.countDocuments()
    const upcomingMatches = await Match.countDocuments({ status: 'upcoming' })
    const totalBookings = await Booking.countDocuments()
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })
    const totalUsers = await User.countDocuments()
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$finalTotal' } } }
    ])
    
    res.json({
      totalMatches,
      upcomingMatches,
      totalBookings,
      todayBookings,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all users (Admin)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Make user admin
router.put('/users/:id/make-admin', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: true },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get recent bookings
router.get('/recent-bookings', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('match', 'team1Short team2Short date')
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update match status
router.put('/matches/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    res.json(match)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
