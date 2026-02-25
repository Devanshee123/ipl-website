import mongoose from 'mongoose'

const stadiumSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  capacity: { type: Number, required: true },
  address: { type: String, required: true },
  image: { type: String, default: null },
  facilities: [{ type: String }],
  parkingAvailable: { type: Boolean, default: true },
  metroConnectivity: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Stadium', stadiumSchema)
