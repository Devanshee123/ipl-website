import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
    
    if (!uri) {
      console.error('❌ Error: MONGODB_URI is not defined in .env file')
      console.log('💡 Please create a .env file with your MongoDB connection string')
      process.exit(1)
    }
    
    console.log('🔌 Connecting to MongoDB...')
    const conn = await mongoose.connect(uri)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📁 Database: ${conn.connection.name}`)
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`)
    if (error.message.includes('bad auth')) {
      console.error('💡 Check your MongoDB username and password in the connection string')
    }
    process.exit(1)
  }
}

export default connectDB
