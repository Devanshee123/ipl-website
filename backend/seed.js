import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Match from './models/Match.js'

dotenv.config()

const matches = [
  {
    team1: 'Mumbai Indians',
    team2: 'Chennai Super Kings',
    team1Short: 'MI',
    team2Short: 'CSK',
    date: new Date('2024-04-15'),
    time: '7:30 PM',
    stadium: 'Wankhede Stadium',
    city: 'Mumbai',
    startingPrice: 2500,
    image: '/images/match-mi-csk.jpg',
    status: 'upcoming',
    categories: [
      { name: 'Premium', price: 7500, rows: 5, seatsPerRow: 20, seats: [] },
      { name: 'Gold', price: 5000, rows: 8, seatsPerRow: 25, seats: [] },
      { name: 'Silver', price: 3500, rows: 10, seatsPerRow: 30, seats: [] },
      { name: 'General', price: 2500, rows: 15, seatsPerRow: 40, seats: [] }
    ]
  },
  {
    team1: 'Royal Challengers Bangalore',
    team2: 'Kolkata Knight Riders',
    team1Short: 'RCB',
    team2Short: 'KKR',
    date: new Date('2024-04-16'),
    time: '7:30 PM',
    stadium: 'M. Chinnaswamy Stadium',
    city: 'Bangalore',
    startingPrice: 2000,
    image: '/images/match-rcb-kkr.jpg',
    status: 'upcoming',
    categories: [
      { name: 'Premium', price: 6500, rows: 5, seatsPerRow: 20, seats: [] },
      { name: 'Gold', price: 4500, rows: 8, seatsPerRow: 25, seats: [] },
      { name: 'Silver', price: 3000, rows: 10, seatsPerRow: 30, seats: [] },
      { name: 'General', price: 2000, rows: 15, seatsPerRow: 40, seats: [] }
    ]
  },
  {
    team1: 'Delhi Capitals',
    team2: 'Punjab Kings',
    team1Short: 'DC',
    team2Short: 'PBKS',
    date: new Date('2024-04-17'),
    time: '7:30 PM',
    stadium: 'Arun Jaitley Stadium',
    city: 'Delhi',
    startingPrice: 1800,
    image: '/images/match-dc-pbks.jpg',
    status: 'upcoming',
    categories: [
      { name: 'Premium', price: 5500, rows: 5, seatsPerRow: 20, seats: [] },
      { name: 'Gold', price: 3800, rows: 8, seatsPerRow: 25, seats: [] },
      { name: 'Silver', price: 2500, rows: 10, seatsPerRow: 30, seats: [] },
      { name: 'General', price: 1800, rows: 15, seatsPerRow: 40, seats: [] }
    ]
  },
  {
    team1: 'Rajasthan Royals',
    team2: 'Gujarat Titans',
    team1Short: 'RR',
    team2Short: 'GT',
    date: new Date('2024-04-18'),
    time: '7:30 PM',
    stadium: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    startingPrice: 2200,
    image: '/images/match-rr-gt.jpg',
    status: 'upcoming',
    categories: [
      { name: 'Premium', price: 7000, rows: 5, seatsPerRow: 20, seats: [] },
      { name: 'Gold', price: 4800, rows: 8, seatsPerRow: 25, seats: [] },
      { name: 'Silver', price: 3200, rows: 10, seatsPerRow: 30, seats: [] },
      { name: 'General', price: 2200, rows: 15, seatsPerRow: 40, seats: [] }
    ]
  },
  {
    team1: 'Sunrisers Hyderabad',
    team2: 'Lucknow Super Giants',
    team1Short: 'SRH',
    team2Short: 'LSG',
    date: new Date('2024-04-19'),
    time: '7:30 PM',
    stadium: 'M. A. Chidambaram Stadium',
    city: 'Chennai',
    startingPrice: 1900,
    image: '/images/match-srh-lsg.jpg',
    status: 'upcoming',
    categories: [
      { name: 'Premium', price: 5800, rows: 5, seatsPerRow: 20, seats: [] },
      { name: 'Gold', price: 4000, rows: 8, seatsPerRow: 25, seats: [] },
      { name: 'Silver', price: 2800, rows: 10, seatsPerRow: 30, seats: [] },
      { name: 'General', price: 1900, rows: 15, seatsPerRow: 40, seats: [] }
    ]
  },
  {
    team1: 'Mumbai Indians',
    team2: 'Royal Challengers Bangalore',
    team1Short: 'MI',
    team2Short: 'RCB',
    date: new Date('2024-04-20'),
    time: '3:30 PM',
    stadium: 'Wankhede Stadium',
    city: 'Mumbai',
    startingPrice: 2500,
    image: '/images/match-mi-rcb.jpg',
    status: 'upcoming',
    categories: [
      { name: 'Premium', price: 8000, rows: 5, seatsPerRow: 20, seats: [] },
      { name: 'Gold', price: 5500, rows: 8, seatsPerRow: 25, seats: [] },
      { name: 'Silver', price: 3800, rows: 10, seatsPerRow: 30, seats: [] },
      { name: 'General', price: 2500, rows: 15, seatsPerRow: 40, seats: [] }
    ]
  }
]

function generateSeats(rows, seatsPerRow) {
  const seats = []
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 0; i < rows; i++) {
    const row = rowLetters[i]
    for (let num = 1; num <= seatsPerRow; num++) {
      seats.push({
        row: row,
        number: num,
        status: 'available',
        bookedBy: null,
        bookingTime: null
      })
    }
  }
  return seats
}

async function seed() {
  try {
    const uri = process.env.MONGODB_URI
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(uri)
    console.log('✅ Connected to MongoDB')

    // Clear existing matches
    console.log('🗑️  Clearing existing matches...')
    await Match.deleteMany({})
    console.log('✅ Cleared existing matches')

    // Generate seats for each category and calculate totals
    const matchesWithSeats = matches.map(match => {
      let totalSeats = 0
      const categories = match.categories.map(cat => {
        const seats = generateSeats(cat.rows, cat.seatsPerRow)
        totalSeats += seats.length
        return { ...cat, seats }
      })
      return {
        ...match,
        categories,
        totalSeats,
        availableSeats: totalSeats,
        bookedSeats: 0
      }
    })

    // Insert matches
    console.log('🌱 Inserting matches...')
    const result = await Match.insertMany(matchesWithSeats)
    console.log(`✅ Inserted ${result.length} matches`)

    // Log summary
    result.forEach(match => {
      console.log(`  • ${match.team1Short} vs ${match.team2Short} at ${match.stadium} - ${match.totalSeats} seats`)
    })

    console.log('\n🎉 Seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seed()
