import mongoose from 'mongoose'

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  number: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked', 'reserved'], default: 'available' },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookingTime: { type: Date, default: null }
})

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true },
  seats: [seatSchema]
})

const matchSchema = new mongoose.Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  team1Short: { type: String, required: true },
  team2Short: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  stadium: { type: String, required: true },
  city: { type: String, required: true },
  startingPrice: { type: Number, required: true },
  image: { type: String, required: true },
  categories: [categorySchema],
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
  totalSeats: { type: Number, default: 0 },
  availableSeats: { type: Number, default: 0 },
  bookedSeats: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Match', matchSchema)
