"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

interface TimeSlot {
  id: string;
  time: string;
  hour: number;
  available: boolean;
  price: number;
  conflictReason?: string;
}

interface BookingData {
  venueId: number;
  courtId: number;
  date: string;
  timeSlot: string;
  duration: number; // in hours
  totalPrice: number;
  userNotes?: string;
}

interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
}

interface Court {
  id: number;
  name: string;
  sport: string;
  pricePerHour: number;
  openTime: number;
  closeTime: number;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const venueId = parseInt(params.venueId as string);
  const courtId = parseInt(params.courtId as string);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [userNotes, setUserNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Mock data - replace with actual API calls
  const mockVenue: Venue = {
    id: 1,
    name: "Elite Sports Complex",
    address: "123 Sports Street, Andheri West",
    city: "Mumbai"
  };

  const mockCourt: Court = {
    id: 1,
    name: "Court 1",
    sport: "Badminton",
    pricePerHour: 1200,
    openTime: 6,
    closeTime: 22
  };

  // Generate date options (next 14 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  const generateTimeSlots = (date: string, openTime: number, closeTime: number) => {
    const slots: TimeSlot[] = [];
    const selectedDateObj = new Date(date);
    const now = new Date();
    
    for (let hour = openTime; hour < closeTime; hour++) {
      const slotDate = new Date(selectedDateObj);
      slotDate.setHours(hour, 0, 0, 0);
      
      // Check if slot is in the past
      const isPast = slotDate < now;
      
      // Mock availability check - in real app, this would be an API call
      const isBooked = Math.random() < 0.3; // 30% chance of being booked
      
      const available = !isPast && !isBooked;
      
      slots.push({
        id: `${date}-${hour}`,
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour,
        available,
        price: mockCourt.pricePerHour,
        conflictReason: isPast ? 'Past time slot' : isBooked ? 'Already booked' : undefined
      });
    }
    
    return slots;
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Set initial date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);

    // Load venue and court data
    setIsLoading(true);
    setTimeout(() => {
      if (venueId === 1 && courtId === 1) {
        setVenue(mockVenue);
        setCourt(mockCourt);
      }
      setIsLoading(false);
    }, 500);
  }, [session, status, router, venueId, courtId]);

  useEffect(() => {
    if (selectedDate && court) {
      const slots = generateTimeSlots(selectedDate, court.openTime, court.closeTime);
      setTimeSlots(slots);
      setSelectedTimeSlot(null); // Reset selected time when date changes
    }
  }, [selectedDate, court]);

  const handleTimeSlotSelect = (slotId: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (slot && slot.available) {
      setSelectedTimeSlot(slotId);
      setBookingError(null);
    }
  };

  const calculateTotalPrice = () => {
    if (!court || !selectedTimeSlot) return 0;
    return court.pricePerHour * duration;
  };

  const handleBooking = async () => {
    if (!venue || !court || !selectedTimeSlot || !session) return;

    setIsBooking(true);
    setBookingError(null);

    try {
      // Create booking data with idempotency key
      const bookingData: BookingData = {
        venueId: venue.id,
        courtId: court.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        duration,
        totalPrice: calculateTotalPrice(),
        userNotes: userNotes.trim() || undefined
      };

      // Add idempotency key for duplicate prevention
      const idempotencyKey = `${session.user.id}-${Date.now()}-${Math.random()}`;

      // Simulate API call with concurrency control
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        setBookingSuccess(true);
        // Redirect to bookings page after a short delay
        setTimeout(() => {
          router.push('/bookings?success=booking-created');
        }, 2000);
      } else {
        const error = await response.json();
        
        if (response.status === 409) {
          setBookingError('This time slot has been booked by another user. Please select a different time.');
          // Refresh time slots to show updated availability
          const slots = generateTimeSlots(selectedDate, court.openTime, court.closeTime);
          setTimeSlots(slots);
          setSelectedTimeSlot(null);
        } else {
          setBookingError(error.message || 'Booking failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError('Network error. Please check your connection and try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!venue || !court) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Booking Not Available</h1>
          <p className="text-gray-600 mt-2">The venue or court you're trying to book doesn't exist.</p>
          <Link
            href="/venues"
            className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Venues
          </Link>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Your booking has been successfully created. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Booking Details:</h3>
              <p className="text-sm text-gray-600">{venue.name} - {court.name}</p>
              <p className="text-sm text-gray-600">
                {new Date(selectedDate).toLocaleDateString()} at {timeSlots.find(s => s.id === selectedTimeSlot)?.time}
              </p>
              <p className="text-sm text-gray-600">Duration: {duration} hour(s)</p>
              <p className="text-sm font-medium text-gray-900">Total: ₹{calculateTotalPrice()}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/bookings"
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                View My Bookings
              </Link>
              <Link
                href="/venues"
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Book Another
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/venues" className="text-gray-500 hover:text-gray-700">
                Venues
              </Link>
            </li>
            <li><span className="text-gray-400">/</span></li>
            <li>
              <Link href={`/venues/${venue.id}`} className="text-gray-500 hover:text-gray-700">
                {venue.name}
              </Link>
            </li>
            <li><span className="text-gray-400">/</span></li>
            <li>
              <span className="text-gray-900 font-medium">Book {court.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue & Court Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <BuildingOfficeIcon className="w-8 h-8 text-primary-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
                  <p className="text-gray-600">{venue.address}, {venue.city}</p>
                </div>
              </div>
              
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h2 className="font-semibold text-primary-900 mb-1">{court.name}</h2>
                <p className="text-primary-700">{court.sport}</p>
                <p className="text-lg font-semibold text-primary-900 mt-2">
                  ₹{court.pricePerHour} per hour
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Select Date
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {generateDateOptions().map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedDate === date.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Select Time Slot
              </h3>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot.id)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedTimeSlot === slot.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : slot.available
                        ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                    title={slot.conflictReason || ''}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <div className="flex items-center mr-6">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center mr-6">
                  <div className="w-3 h-3 bg-primary-50 border border-primary-500 rounded mr-2"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded mr-2"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* Duration Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration</h3>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Hours:</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4].map(hours => (
                    <option key={hours} value={hours}>
                      {hours} hour{hours > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes (Optional)</h3>
              
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Any special requests or notes for your booking..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Booking Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Court:</span>
                    <span className="font-medium">{court.name}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {selectedDate ? new Date(selectedDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {selectedTimeSlot ? timeSlots.find(s => s.id === selectedTimeSlot)?.time : '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{duration} hour{duration > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per hour:</span>
                    <span className="font-medium">₹{court.pricePerHour}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-gray-900">₹{calculateTotalPrice()}</span>
                    </div>
                  </div>
                </div>

                {bookingError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-sm text-red-700">{bookingError}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={!selectedTimeSlot || isBooking}
                  className="w-full mt-6 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isBooking ? 'Processing...' : 'Confirm Booking'}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  You'll be redirected to payment after confirmation
                </p>
              </div>

              {/* User Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking For</h3>
                <div className="flex items-center">
                  <UserIcon className="w-8 h-8 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{session?.user?.fullName}</p>
                    <p className="text-sm text-gray-600">{session?.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
