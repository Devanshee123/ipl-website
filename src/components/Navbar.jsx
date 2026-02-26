import { useState } from 'react'
import { useAppContext } from '../App'
import { Search, MapPin, ChevronDown, User, Menu, X, Shield } from 'lucide-react'

export default function Navbar() {
  const { setCurrentView, selectedCity, setSelectedCity, cities, isAdmin, setIsAdmin } = useAppContext()
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentView('home')}>
              <img src="/images/bookmyshow-logo-removebg-preview.png" alt="BookMyShow" className="h-12 w-auto" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for matches, teams..."
                className="w-full pl-10 pr-4 py-2 bg-[#F5F5F5] border border-transparent rounded-md text-sm text-[#222222] placeholder:text-[#999999] focus:outline-none focus:bg-white focus:border-[#E5E5E5] transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* City Selector */}
            <div className="hidden sm:relative">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#222222] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                {selectedCity}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showCityDropdown && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-md shadow-lg shadow-black/10 border border-[#E5E5E5] py-1 z-50">
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city)
                        setShowCityDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        selectedCity === city ? 'bg-[#F84464]/10 text-[#F84464]' : 'text-[#666666] hover:bg-[#F5F5F5]'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Toggle */}
            <button
              onClick={() => {
                setIsAdmin(!isAdmin)
                setCurrentView(isAdmin ? 'home' : 'admin')
              }}
              className={`hidden sm:flex items-center gap-1.5 text-sm transition-colors ${
                isAdmin ? 'text-[#F84464]' : 'text-[#666666] hover:text-[#222222]'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>

            {/* Sign In */}
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#222222] transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-1 text-[#666666]"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-[#E5E5E5]">
          <div className="px-4 py-4 space-y-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F5] rounded-md text-sm"
            />
            <div className="flex flex-col gap-2">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city)
                    setShowMobileMenu(false)
                  }}
                  className="text-left px-4 py-2 text-sm text-[#666666] hover:bg-[#F5F5F5] rounded-md"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
