'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Video, Phone, User, Plus } from 'lucide-react'

interface BookNowButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'floating'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  title?: string
  description?: string
  duration?: number
  price?: number
  location?: string
  meetingTypes?: ('video_call' | 'phone_call' | 'in_person')[]
}

export function BookNowButton({
  variant = 'default',
  size = 'md',
  className = '',
  title = 'Consultation',
  description = 'Schedule a consultation with our team',
  duration = 30,
  price = 0,
  location = 'Video Call',
  meetingTypes = ['video_call', 'phone_call']
}: BookNowButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }

    const variantClasses = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 rounded-lg',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 rounded-lg',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500 rounded-lg',
      floating: 'fixed bottom-6 right-6 z-50 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 p-4'
    }

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={getButtonClasses()}
        title={`Book ${title}`}
      >
        {variant === 'floating' ? (
          <Plus className="h-6 w-6" />
        ) : (
          <>
            <Calendar className="h-4 w-4" />
            <span>Book Now</span>
          </>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
                {price > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                  </div>
                )}
                <p className="text-sm text-gray-600">{description}</p>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-600">
              <p>Click Continue to open our booking calendar and select your preferred time.</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Redirect to actual booking page or integration
                  window.open('/admin/collections/appointments/create', '_blank')
                  setIsOpen(false)
                }}
                className="flex-1"
              >
                Continue to Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
