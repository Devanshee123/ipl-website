import express from 'express'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Initiate UPI Payment
router.post('/upi/initiate', protect, async (req, res) => {
  try {
    const { amount, bookingId, matchName } = req.body
    
    const merchantUpiId = process.env.MERCHANT_UPI_ID || 'ticketnest@upi'
    const merchantName = process.env.MERCHANT_NAME || 'TicketNest'
    const transactionId = `TN${Date.now()}`
    const transactionNote = `IPL Tickets - ${matchName}`
    
    // Generate UPI deep link
    const upiUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&cu=INR`
    
    // App-specific schemes
    const appSchemes = {
      gpay: `tez://upi/pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&cu=INR`,
      phonepe: `phonepe://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&cu=INR`,
      paytm: `paytmmp://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&cu=INR`,
      amazonpay: `amazonpay://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&cu=INR`
    }
    
    res.json({
      transactionId,
      upiUrl,
      appSchemes,
      amount,
      merchantUpiId,
      merchantName,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min expiry
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Verify Payment (Callback from UPI app or manual verification)
router.post('/verify', protect, async (req, res) => {
  try {
    const { transactionId, bookingId, status, utrNumber } = req.body
    
    // In production, verify with actual payment gateway
    // For now, accept the status from client
    
    res.json({
      success: status === 'success',
      transactionId,
      verifiedAt: new Date()
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get payment status
router.get('/status/:transactionId', protect, async (req, res) => {
  try {
    // Query payment status from database or payment gateway
    res.json({
      transactionId: req.params.transactionId,
      status: 'pending', // or 'completed', 'failed'
      timestamp: new Date()
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
