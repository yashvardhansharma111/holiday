"use client"

import type React from "react"

import { useState } from "react"

const popularDestinations = [
  "New York, NY",
  "Los Angeles, CA",
  "Miami, FL",
  "Las Vegas, NV",
  "San Francisco, CA",
  "Chicago, IL",
  "Orlando, FL",
  "Nashville, TN",
]

const Button = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"} ${className}`}
  >
    {children}
  </button>
)

const Popover = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) => <div className="relative">{children}</div>

const PopoverTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

const PopoverContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border z-50 ${className}`}>
    {children}
  </div>
)

export default function SearchForm() {
  const [location, setLocation] = useState("")
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [pets, setPets] = useState(false)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)

  const handleLocationSelect = (destination: string) => {
    setLocation(destination)
    setShowLocationDropdown(false)
  }

  const guestText = () => {
    const total = adults + children
    if (total === 1) return "1 guest"
    return `${total} guests`
  }

  const dateText = () => {
    if (checkIn && checkOut) {
      return `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`
    }
    return "Anytime"
  }

  return (
    <div className="bg-white rounded-full p-4 md:p-5 shadow-2xl flex flex-row items-center gap-0 w-full max-w-7xl mx-auto relative z-20 backdrop-blur-sm bg-white/95 min-h-[96px] md:min-h-[104px] md:scale-[1.05]">
      {/* Location Search */}
      <Popover open={showLocationDropdown} onOpenChange={setShowLocationDropdown}>
        <PopoverTrigger>
          <div
            className="basis-1/3 min-w-[260px] flex items-center gap-4 px-10 py-6 cursor-pointer hover:bg-gray-50 rounded-l-full transition-colors"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">Where to?</span>
              <input
                placeholder="Search destinations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setShowLocationDropdown(true)}
                className="border-0 bg-transparent text-gray-600 placeholder:text-gray-400 focus:outline-none p-0 text-base w-full min-w-[200px]"
              />
            </div>
            {location && (
              <svg
                className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setLocation("")
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </PopoverTrigger>
        {showLocationDropdown && (
          <PopoverContent className="w-80 p-0">
            <div className="p-4">
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Popular destinations</h4>
              <div className="space-y-2">
                {popularDestinations.map((destination) => (
                  <div
                    key={destination}
                    className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm"
                    onClick={() => handleLocationSelect(destination)}
                  >
                    {destination}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>

      <div className="w-px bg-gray-200 h-14 md:h-16"></div>

      {/* Date Picker */}
      <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
        <PopoverTrigger>
          <div
            className="basis-1/3 min-w-[220px] flex items-center gap-4 px-10 py-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">When</span>
              <span className="text-gray-600 text-base">{dateText()}</span>
            </div>
          </div>
        </PopoverTrigger>
        {showDatePicker && (
          <PopoverContent className="w-auto p-4">
            <div className="text-sm text-gray-600">Select your dates</div>
          </PopoverContent>
        )}
      </Popover>

      <div className="w-px bg-gray-200 h-16"></div>

      {/* Guests Selector */}
      <Popover open={showGuestDropdown} onOpenChange={setShowGuestDropdown}>
        <PopoverTrigger>
          <div
            className="basis-1/3 min-w-[220px] flex items-center gap-4 px-10 py-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">Guests</span>
              <span className="text-gray-600 text-base">{guestText()}</span>
            </div>
          </div>
        </PopoverTrigger>
        {showGuestDropdown && (
          <PopoverContent className="w-80 p-0">
            <div className="p-4 space-y-4">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">Adults</div>
                  <div className="text-xs text-gray-500">Ages 13 or above</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 bg-white text-gray-600"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </Button>
                  <span className="w-8 text-center text-sm">{adults}</span>
                  <Button
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 bg-white text-gray-600"
                    onClick={() => setAdults(adults + 1)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">Children</div>
                  <div className="text-xs text-gray-500">Ages 2-12</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 bg-white text-gray-600"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </Button>
                  <span className="w-8 text-center text-sm">{children}</span>
                  <Button
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 bg-white text-gray-600"
                    onClick={() => setChildren(children + 1)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
        </PopoverContent>
      )}
    </Popover>

    <div className="pl-4 pr-2">
      <Button className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white px-14 py-5 rounded-full font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
        Search
      </Button>
    </div>
  </div>
  )
}
