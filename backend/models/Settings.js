import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    default: 'ticketnest@upi',
    trim: true
  },
  upiName: {
    type: String,
    default: 'TicketNest Payments',
    trim: true
  },
  upiQrCode: {
    type: String,
    default: ''
  }
}, { timestamps: true })

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

export default mongoose.model('Settings', settingsSchema)
