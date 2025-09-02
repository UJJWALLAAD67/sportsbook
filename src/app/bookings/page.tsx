"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

interface Booking {
  id: number;
  court: {
    id: number;
    name: string;
    sport: string;
    pricePerHour: number;
    venue: {
      id: number;
      name: string;
      address: string;
      city: string;
    };
  };
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  payment?: {
    id: number;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  };
  notes?: string;
  createdAt: string;
}

type BookingTab = "upcoming" | "past" | "cancelled";

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success message from URL params
  useEffect(() => {
    if (searchParams.get("success") === "booking-created") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  // Mock data - replace with actual API call
  const mockBookings: Booking[] = [
    {
      id: 1,
      court: {
        id: 1,
        name: "Court 1",
        sport: "Badminton",
        pricePerHour: 1200,
        venue: {
          id: 1,
          name: "Elite Sports Complex",
          address: "123 Sports Street, Andheri West",
          city: "Mumbai"
        }
      },
      startTime: "2024-03-15T10:00:00Z",
      endTime: "2024-03-15T11:00:00Z",
      status: "CONFIRMED",
      payment: {
        id: 1,
        amount: 120000, // 1200 * 100 (paisa)
        currency: "INR",
        status: "SUCCEEDED"
      },
      notes: "Please keep equipment ready",
      createdAt: "2024-03-10T08:30:00Z"
    },
    {
      id: 2,
      court: {
        id: 4,
        name: "Court A",
        sport: "Tennis", 
        pricePerHour: 2000,
        venue: {
          id: 2,
          name: "Tennis Arena Pro",
          address: "456 Tennis Ave, Bandra",
          city: "Mumbai"
        }
      },
      startTime: "2024-03-20T16:00:00Z",
      endTime: "2024-03-20T18:00:00Z",
      status: "PENDING",
      payment: {
        id: 2,
        amount: 400000, // 2000 * 2 * 100 (paisa)
        currency: "INR",
        status: "PENDING"
      },
      createdAt: "2024-03-12T14:20:00Z"
    },
    {
      id: 3,
      court: {
        id: 1,
        name: "Court 2",
        sport: "Badminton",
        pricePerHour: 1200,
        venue: {
          id: 1,
          name: "Elite Sports Complex",
          address: "123 Sports Street, Andheri West",
          city: "Mumbai"
        }
      },
      startTime: "2024-02-25T14:00:00Z",
      endTime: "2024-02-25T15:00:00Z",
      status: "COMPLETED",
      payment: {
        id: 3,
        amount: 120000,
        currency: "INR",
        status: "SUCCEEDED"
      },
      createdAt: "2024-02-20T10:15:00Z"
    },
    {
      id: 4,
      court: {
        id: 9,
        name: "Main Field",
        sport: "Football",
        pricePerHour: 3000,
        venue: {
          id: 4,
          name: "Football Ground Central",
          address: "321 Field Road, Malad",
          city: "Mumbai"
        }
      },
      startTime: "2024-02-28T18:00:00Z",
      endTime: "2024-02-28T19:00:00Z",
      status: "CANCELLED",
      payment: {
        id: 4,
        amount: 300000,
        currency: "INR",
        status: "REFUNDED"
      },
      createdAt: "2024-02-25T09:45:00Z"
    }
  ];

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Simulate API loading
    setIsLoading(true);
    setTimeout(() => {
      setBookings(mockBookings);
      setIsLoading(false);
    }, 1000);
  }, [session, status, router]);

  const filterBookingsByTab = (bookings: Booking[], tab: BookingTab) => {
    const now = new Date();
    
    switch (tab) {
      case "upcoming":
        return bookings.filter(booking => {
          const startTime = new Date(booking.startTime);
          return startTime > now && (booking.status === "PENDING" || booking.status === "CONFIRMED");
        });
      case "past":
        return bookings.filter(booking => {
          const startTime = new Date(booking.startTime);
          return startTime <= now || booking.status === "COMPLETED";
        });
      case "cancelled":
        return bookings.filter(booking => booking.status === "CANCELLED");
      default:
        return bookings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    setIsCancelling(bookingId);
    
    try {
      // TODO: Implement actual cancellation API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: "CANCELLED" as const }
          : booking
      ));
    } catch (error) {
      console.error("Cancellation failed:", error);
    } finally {
      setIsCancelling(null);
    }
  };

  const canCancelBooking = (booking: Booking) => {
    const startTime = new Date(booking.startTime);
    const now = new Date();
    const hoursUntilBooking = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can cancel if booking is more than 2 hours away and status is PENDING or CONFIRMED
    return hoursUntilBooking > 2 && (booking.status === "PENDING" || booking.status === "CONFIRMED");
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredBookings = filterBookingsByTab(bookings, activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">
              Manage your sports facility bookings
            </p>
          </div>
          <Link
            href="/venues"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Book New Venue
          </Link>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                Booking created successfully! You'll receive a confirmation email shortly.
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: "upcoming" as BookingTab, label: "Upcoming", count: filterBookingsByTab(bookings, "upcoming").length },
                { key: "past" as BookingTab, label: "Past", count: filterBookingsByTab(bookings, "past").length },
                { key: "cancelled" as BookingTab, label: "Cancelled", count: filterBookingsByTab(bookings, "cancelled").length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.key
                        ? "bg-primary-100 text-primary-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No {activeTab} bookings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming bookings. Book a venue to get started!"
                    : activeTab === "past"
                    ? "No past bookings to show."
                    : "No cancelled bookings to show."
                  }
                </p>
                {activeTab === "upcoming" && (
                  <div className="mt-6">
                    <Link
                      href="/venues"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Book a Venue
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const { date, time } = formatDateTime(booking.startTime);
                  const duration = calculateDuration(booking.startTime, booking.endTime);
                  const totalAmount = booking.payment ? booking.payment.amount / 100 : 0;

                  return (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          {/* Venue & Court Info */}
                          <div className="flex items-start mb-4">
                            <BuildingOfficeIcon className="w-8 h-8 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.court.venue.name} - {booking.court.name}
                              </h3>
                              <p className="text-gray-600">{booking.court.sport}</p>
                              <div className="flex items-center text-gray-500 text-sm mt-1">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {booking.court.venue.address}, {booking.court.venue.city}
                              </div>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center text-sm">
                              <CalendarDaysIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{time} ({duration}h)</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-2" />
                              <span>₹{totalAmount}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              {booking.payment && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment.status)}`}>
                                  {booking.payment.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {booking.notes && (
                            <div className="text-sm text-gray-600 mb-4">
                              <span className="font-medium">Notes:</span> {booking.notes}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-2 lg:ml-6">
                          <Link
                            href={`/venues/${booking.court.venue.id}`}
                            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            View Venue
                          </Link>
                          
                          {canCancelBooking(booking) && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isCancelling === booking.id}
                              className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                            >
                              {isCancelling === booking.id ? (
                                "Cancelling..."
                              ) : (
                                <>
                                  <XMarkIcon className="w-4 h-4 mr-1" />
                                  Cancel
                                </>
                              )}
                            </button>
                          )}
                          
                          {booking.payment?.status === "PENDING" && (
                            <button className="inline-flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                              Pay Now
                            </button>
                          )}
                          
                          {activeTab === "past" && booking.status === "COMPLETED" && (
                            <button className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                              Write Review
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Booking Timeline (for upcoming bookings) */}
                      {activeTab === "upcoming" && booking.status === "CONFIRMED" && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                            <span>Booking confirmed - You're all set!</span>
                          </div>
                        </div>
                      )}

                      {activeTab === "upcoming" && booking.status === "PENDING" && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center text-sm text-yellow-600">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                            <span>Payment pending - Please complete payment to confirm your booking</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
