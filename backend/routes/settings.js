import express from 'express'
import Settings from '../models/Settings.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Get payment settings (Public)
router.get('/payment', async (req, res) => {
  try {
    const settings = await Settings.getSettings()
    res.json({
      upiId: settings.upiId,
      upiName: settings.upiName,
      upiQrCode: settings.upiQrCode
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update payment settings (Public for now)
router.put('/payment', async (req, res) => {
  try {
    const { upiId, upiName, upiQrCode } = req.body
    
    let settings = await Settings.findOne()
    if (!settings) {
      settings = new Settings()
    }
    
    if (upiId) settings.upiId = upiId.trim()
    if (upiName) settings.upiName = upiName.trim()
    if (upiQrCode !== undefined) settings.upiQrCode = upiQrCode
    
    await settings.save()
    
    res.json({
      message: 'Payment settings updated successfully',
      settings: {
        upiId: settings.upiId,
        upiName: settings.upiName,
        upiQrCode: settings.upiQrCode
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
