"use client"

import type React from "react"
import { useState, useEffect } from "react"

const Calendar = ({
  onDateSelect,
  selectedDates,
  onClose,
}: {
  onDateSelect: (checkIn: Date | undefined, checkOut: Date | undefined) => void
  selectedDates: { checkIn?: Date; checkOut?: Date }
  onClose: () => void
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tempCheckIn, setTempCheckIn] = useState<Date | undefined>(selectedDates.checkIn)
  const [tempCheckOut, setTempCheckOut] = useState<Date | undefined>(selectedDates.checkOut)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const handleDateClick = (date: Date) => {
    if (date < today) return

    if (!tempCheckIn || (tempCheckIn && tempCheckOut)) {
      // First selection or reset
      setTempCheckIn(date)
      setTempCheckOut(undefined)
    } else if (date < tempCheckIn) {
      // Selected date is before check-in, make it the new check-in
      setTempCheckIn(date)
      setTempCheckOut(undefined)
    } else {
      // Selected date is after check-in, make it check-out
      setTempCheckOut(date)
    }
  }

  const isDateInRange = (date: Date) => {
    if (!tempCheckIn || !tempCheckOut) return false
    return date >= tempCheckIn && date <= tempCheckOut
  }

  const isDateSelected = (date: Date) => {
    if (!date) return false
    return (tempCheckIn && date.getTime() === tempCheckIn.getTime()) ||
           (tempCheckOut && date.getTime() === tempCheckOut.getTime())
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleApply = () => {
    onDateSelect(tempCheckIn, tempCheckOut)
    onClose()
  }

  const handleClear = () => {
    setTempCheckIn(undefined)
    setTempCheckOut(undefined)
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-10"></div>
          }

          const isPast = date < today
          const isSelected = isDateSelected(date)
          const inRange = isDateInRange(date)
          const isToday = date.getTime() === today.getTime()

          return (
            <button
              key={date.getTime()}
              onClick={() => handleDateClick(date)}
              disabled={isPast}
              className={`
                h-10 text-sm rounded-lg transition-all duration-200 relative
                ${isPast 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-purple-50 cursor-pointer'
                }
                ${isSelected 
                  ? 'bg-purple-600 text-white font-semibold shadow-md' 
                  : ''
                }
                ${inRange && !isSelected 
                  ? 'bg-purple-100 text-purple-700' 
                  : ''
                }
                ${isToday && !isSelected 
                  ? 'ring-2 ring-purple-300 font-semibold' 
                  : ''
                }
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* Selected dates display */}
      {(tempCheckIn || tempCheckOut) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {tempCheckIn && (
              <div>Check-in: <span className="font-semibold">{tempCheckIn.toLocaleDateString()}</span></div>
            )}
            {tempCheckOut && (
              <div>Check-out: <span className="font-semibold">{tempCheckOut.toLocaleDateString()}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default Calendar