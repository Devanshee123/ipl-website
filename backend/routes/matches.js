import express from 'express'
import Match from '../models/Match.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Get all matches
router.get('/', async (req, res) => {
  try {
    const { city, status, team } = req.query
    let query = {}
    
    if (city) query.city = city
    if (status) query.status = status
    if (team) {
      query.$or = [
        { team1: { $regex: team, $options: 'i' } },
        { team2: { $regex: team, $options: 'i' } }
      ]
    }
    
    const matches = await Match.find(query).sort({ date: 1 })
    res.json(matches)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single match
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
    if (!match) {
      return res.status(404).json({ message: 'Match not found' })
    }
    res.json(match)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create match (Admin only) - Temporarily allowing public access for development
router.post('/', async (req, res) => {
  try {
    const matchData = req.body
    
    // Initialize seats for each category
    matchData.categories = matchData.categories.map(cat => ({
      ...cat,
      seats: generateSeats(cat.rows, cat.seatsPerRow)
    }))
    
    // Calculate totals
    matchData.totalSeats = matchData.categories.reduce((sum, cat) => 
      sum + (cat.rows * cat.seatsPerRow), 0)
    matchData.availableSeats = matchData.totalSeats
    matchData.bookedSeats = 0
    
    const match = await Match.create(matchData)
    res.status(201).json(match)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update match (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!match) {
      return res.status(404).json({ message: 'Match not found' })
    }
    res.json(match)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete match (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id)
    if (!match) {
      return res.status(404).json({ message: 'Match not found' })
    }
    res.json({ message: 'Match deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get available seats for a match
router.get('/:id/seats', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
    if (!match) {
      return res.status(404).json({ message: 'Match not found' })
    }
    res.json(match.categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Helper function to generate seats
function generateSeats(rows, seatsPerRow) {
  const seats = []
  for (let row = 0; row < rows; row++) {
    const rowLabel = String.fromCharCode(65 + row)
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      seats.push({
        row: rowLabel,
        number: seat,
        status: Math.random() < 0.2 ? 'booked' : 'available'
      })
    }
  }
  return seats
}

export default router
