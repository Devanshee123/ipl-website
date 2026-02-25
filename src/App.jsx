import { useState, createContext, useContext, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MatchesSection from './components/MatchesSection'
import Footer from './components/Footer'
import MatchDetailsPage from './pages/MatchDetailsPage'
import SeatSelectionPage from './pages/SeatSelectionPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminPanel from './pages/AdminPanel'
import { matchAPI } from './services/api'

const AppContext = createContext()

export const useAppContext = () => useContext(AppContext)

const cities = ['All Cities', 'Mumbai', 'Bangalore', 'Delhi', 'Mohali', 'Chennai', 'Kolkata', 'Hyderabad']
const stadiums = ['All Stadiums', 'Wankhede Stadium', 'M Chinnaswamy Stadium', 'Arun Jaitley Stadium', 'PCA Stadium', 'Chepauk', 'Eden Gardens']

const initialMatches = [
  {
    id: 1,
    team1: 'Mumbai Indians',
    team2: 'Chennai Super Kings',
    team1Short: 'MI',
    team2Short: 'CSK',
    date: '2024-03-15',
    time: '7:30 PM',
    stadium: 'Wankhede Stadium',
    city: 'Mumbai',
    startingPrice: 1500,
    image: '/images/match-mi-csk.jpg',
    categories: [
      { name: 'Platinum', price: 8000, rows: 5, seatsPerRow: 20 },
      { name: 'Gold', price: 5000, rows: 8, seatsPerRow: 25 },
      { name: 'Silver', price: 3000, rows: 10, seatsPerRow: 30 },
      { name: 'General', price: 1500, rows: 15, seatsPerRow: 40 }
    ]
  },
  {
    id: 2,
    team1: 'Royal Challengers Bangalore',
    team2: 'Kolkata Knight Riders',
    team1Short: 'RCB',
    team2Short: 'KKR',
    date: '2024-03-16',
    time: '7:30 PM',
    stadium: 'M Chinnaswamy Stadium',
    city: 'Bangalore',
    startingPrice: 1200,
    image: '/images/match-rcb-kkr.jpg',
    categories: [
      { name: 'Platinum', price: 7000, rows: 5, seatsPerRow: 20 },
      { name: 'Gold', price: 4500, rows: 8, seatsPerRow: 25 },
      { name: 'Silver', price: 2500, rows: 10, seatsPerRow: 30 },
      { name: 'General', price: 1200, rows: 15, seatsPerRow: 40 }
    ]
  },
  {
    id: 3,
    team1: 'Delhi Capitals',
    team2: 'Rajasthan Royals',
    team1Short: 'DC',
    team2Short: 'RR',
    date: '2024-03-17',
    time: '3:30 PM',
    stadium: 'Arun Jaitley Stadium',
    city: 'Delhi',
    startingPrice: 1000,
    image: '/images/match-dc-pbks.jpg',
    categories: [
      { name: 'Platinum', price: 6000, rows: 5, seatsPerRow: 20 },
      { name: 'Gold', price: 4000, rows: 8, seatsPerRow: 25 },
      { name: 'Silver', price: 2200, rows: 10, seatsPerRow: 30 },
      { name: 'General', price: 1000, rows: 15, seatsPerRow: 40 }
    ]
  },
  {
    id: 4,
    team1: 'Punjab Kings',
    team2: 'Sunrisers Hyderabad',
    team1Short: 'PBKS',
    team2Short: 'SRH',
    date: '2024-03-18',
    time: '7:30 PM',
    stadium: 'PCA Stadium',
    city: 'Mohali',
    startingPrice: 800,
    image: '/images/match-rr-gt.jpg',
    categories: [
      { name: 'Platinum', price: 5500, rows: 5, seatsPerRow: 20 },
      { name: 'Gold', price: 3500, rows: 8, seatsPerRow: 25 },
      { name: 'Silver', price: 2000, rows: 10, seatsPerRow: 30 },
      { name: 'General', price: 800, rows: 15, seatsPerRow: 40 }
    ]
  }
]

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedStadium, setSelectedStadium] = useState('All Stadiums')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [currentBooking, setCurrentBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [matches, setMatches] = useState(initialMatches)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch matches from backend
  useEffect(() => {
    const fetchMatches = async () => {
      console.log('🔍 Fetching matches from API...')
      try {
        setLoading(true)
        const data = await matchAPI.getAll()
        console.log('✅ API Success - Matches fetched:', data.length)
        setMatches(data)
        setError(null)
      } catch (err) {
        console.error('❌ API Failed:', err.message)
        setError('Failed to load matches. Using local data.')
        // Fallback to initial matches already set
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const toggleSeatSelection = (seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id)
      if (exists) {
        return prev.filter(s => s.id !== seat.id)
      }
      if (prev.length >= 10) return prev
      return [...prev, seat]
    })
  }

  const clearSeatSelection = () => setSelectedSeats([])

  const addBooking = (booking) => {
    setBookings(prev => [...prev, booking])
    setCurrentBooking(booking)
  }

  const deleteMatch = (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId))
  }

  const contextValue = {
    matches,
    setMatches,
    cities,
    stadiums,
    currentView,
    setCurrentView,
    selectedMatch,
    setSelectedMatch,
    selectedCity,
    setSelectedCity,
    selectedStadium,
    setSelectedStadium,
    selectedCategory,
    setSelectedCategory,
    selectedSeats,
    toggleSeatSelection,
    clearSeatSelection,
    currentBooking,
    addBooking,
    bookings,
    isAdmin,
    setIsAdmin,
    deleteMatch,
    loading,
    error
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero />
            <MatchesSection />
          </>
        )
      case 'match-details':
        return <MatchDetailsPage />
      case 'seat-selection':
        return <SeatSelectionPage />
      case 'checkout':
        return <CheckoutPage />
      case 'confirmation':
        return <ConfirmationPage />
      case 'admin-bookings':
      case 'admin':
        return <AdminPanel />
      default:
        return (
          <>
            <Hero />
            <MatchesSection />
          </>
        )
    }
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          {renderView()}
        </main>
        {currentView === 'home' && <Footer />}
      </div>
    </AppContext.Provider>
  )
}

export default App
