import { useState } from 'react'
import { useAppContext } from '../App'
import { ArrowLeft, Calendar, DollarSign, Users, Ticket, Search, Trash2, Edit, Plus, LayoutDashboard, CreditCard } from 'lucide-react'

export default function AdminPanel() {
  const { matches, bookings, setCurrentView, setSelectedMatch, deleteMatch } = useAppContext()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  const totalRevenue = bookings.reduce((sum, b) => sum + b.finalTotal, 0)
  const totalTickets = bookings.reduce((sum, b) => sum + b.seats.length, 0)
  const totalBookings = bookings.length

  const filteredMatches = matches.filter(match =>
    match.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.stadium.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditMatch = (match) => {
    setSelectedMatch(match)
    alert('Edit match functionality would open a modal here')
  }

  const handleDeleteMatch = (matchId) => {
    if (confirm('Are you sure you want to delete this match?')) {
      deleteMatch(matchId)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: matches.length, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Total Bookings', value: totalBookings, icon: Ticket, color: 'bg-green-500' },
          { label: 'Tickets Sold', value: totalTickets, icon: Users, color: 'bg-purple-500' },
          { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'bg-[#F84464]' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-[#E5E5E5] p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-[#666666]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#222222]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg border border-[#E5E5E5]">
        <div className="px-4 py-3 border-b border-[#E5E5E5]">
          <h3 className="font-medium text-[#222222]">Recent Bookings</h3>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {bookings.slice(-5).reverse().map(booking => (
            <div key={booking.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#222222] text-sm">{booking.id}</p>
                <p className="text-xs text-[#666666]">
                  {booking.match.team1Short} vs {booking.match.team2Short} • {booking.seats.length} seats
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-[#222222] text-sm">₹{booking.finalTotal.toLocaleString()}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="px-4 py-8 text-center text-[#999999]">No bookings yet</div>
          )}
        </div>
      </div>
    </div>
  )

  const renderEvents = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-md text-sm"
          />
        </div>
        <button
          onClick={() => alert('Add event functionality would open a modal')}
          className="ml-4 px-4 py-2.5 bg-[#F84464] text-white text-sm font-medium rounded-md hover:bg-[#E03454] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#F5F5F5] text-sm font-medium text-[#666666]">
          <div className="col-span-4">Event</div>
          <div className="col-span-3">Date & Venue</div>
          <div className="col-span-2">Starting Price</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
          {filteredMatches.map(match => (
            <div key={match.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
              <div className="col-span-4">
                <p className="font-medium text-[#222222] text-sm">{match.team1} vs {match.team2}</p>
                <p className="text-xs text-[#666666]">{match.city}</p>
              </div>
              <div className="col-span-3 text-sm text-[#666666]">
                <p>{formatDate(match.date)}</p>
                <p>{match.stadium}</p>
              </div>
              <div className="col-span-2 text-sm text-[#222222]">
                ₹{match.startingPrice.toLocaleString()}
              </div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditMatch(match)}
                  className="p-2 text-[#666666] hover:text-[#F84464] hover:bg-[#F84464]/10 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMatch(match.id)}
                  className="p-2 text-[#666666] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="bg-white rounded-lg border border-[#E5E5E5]">
      <div className="px-4 py-3 border-b border-[#E5E5E5]">
        <h3 className="font-medium text-[#222222]">All Bookings</h3>
      </div>
      <div className="divide-y divide-[#E5E5E5]">
        {bookings.map(booking => (
          <div key={booking.id} className="px-4 py-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-[#222222]">{booking.id}</p>
                <p className="text-sm text-[#666666]">{formatDate(booking.bookingDate)}</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                {booking.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#666666]">Customer</p>
                <p className="text-[#222222]">{booking.customerName}</p>
                <p className="text-[#666666] text-xs">{booking.customerEmail}</p>
              </div>
              <div>
                <p className="text-[#666666]">Event</p>
                <p className="text-[#222222]">{booking.match.team1Short} vs {booking.match.team2Short}</p>
                <p className="text-[#666666] text-xs">{booking.seats.length} seats</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
              <span className="text-sm text-[#666666]">Total</span>
              <span className="font-bold text-[#F84464]">₹{booking.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="px-4 py-8 text-center text-[#999999]">No bookings yet</div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 text-[#666666] hover:text-[#222222] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Home</span>
              </button>
              <h1 className="text-xl font-bold text-[#222222] hidden sm:block">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-lg border border-[#E5E5E5] w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'bookings', label: 'Bookings', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#F84464] text-white'
                  : 'text-[#666666] hover:text-[#222222] hover:bg-[#F5F5F5]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'bookings' && renderBookings()}
      </div>
    </div>
  )
}
