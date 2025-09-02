"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  rating: number | null;
  totalReviews: number;
  photos: string[];
  amenities: string[];
  courts: Array<{
    id: number;
    name: string;
    sport: string;
    pricePerHour: number;
    openTime: number;
    closeTime: number;
  }>;
  owner: {
    name: string;
    businessName?: string;
  };
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const venueId = parseInt(params.id as string);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);

  // Mock data - replace with actual API call
  const mockVenue: Venue = {
    id: 1,
    name: "Elite Sports Complex",
    description: "Premier badminton facility with 6 professional courts, air conditioning, and modern amenities. Perfect for both casual games and competitive matches. Our courts feature high-quality wooden flooring and proper lighting for an optimal playing experience.",
    address: "123 Sports Street, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    rating: 4.8,
    totalReviews: 127,
    photos: [],
    amenities: ["Parking", "Changing Rooms", "Lighting", "Air Conditioning", "Shower", "Equipment Rental", "Cafeteria", "Wi-Fi"],
    courts: [
      { id: 1, name: "Court 1", sport: "Badminton", pricePerHour: 1200, openTime: 6, closeTime: 22 },
      { id: 2, name: "Court 2", sport: "Badminton", pricePerHour: 1200, openTime: 6, closeTime: 22 },
      { id: 3, name: "Court 3", sport: "Badminton", pricePerHour: 1200, openTime: 6, closeTime: 22 },
      { id: 4, name: "Court 4", sport: "Badminton", pricePerHour: 1200, openTime: 6, closeTime: 22 },
      { id: 5, name: "Court 5", sport: "Badminton", pricePerHour: 1200, openTime: 6, closeTime: 22 },
      { id: 6, name: "Court 6", sport: "Badminton", pricePerHour: 1200, openTime: 6, closeTime: 22 }
    ],
    owner: {
      name: "Rajesh Sharma",
      businessName: "Elite Sports Pvt Ltd"
    }
  };

  const mockReviews: Review[] = [
    {
      id: 1,
      userName: "Amit Patel",
      rating: 5,
      comment: "Excellent facility with well-maintained courts. The staff is very professional and helpful.",
      createdAt: "2024-02-15"
    },
    {
      id: 2,
      userName: "Priya Singh",
      rating: 4,
      comment: "Great courts and good amenities. Parking can be a bit challenging during peak hours.",
      createdAt: "2024-02-10"
    },
    {
      id: 3,
      userName: "Kiran Kumar",
      rating: 5,
      comment: "Perfect for badminton! The courts are well-lit and the AC keeps the temperature comfortable.",
      createdAt: "2024-02-05"
    }
  ];

  useEffect(() => {
    // Simulate API loading
    setIsLoading(true);
    setTimeout(() => {
      if (venueId === 1) {
        setVenue(mockVenue);
        setReviews(mockReviews);
      }
      setIsLoading(false);
    }, 1000);
  }, [venueId]);

  const handleBookCourt = (courtId: number) => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    
    // Navigate to booking page
    router.push(`/book/${venueId}/${courtId}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Venue Not Found</h1>
          <p className="text-gray-600 mt-2">The venue you're looking for doesn't exist.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/venues" className="text-gray-500 hover:text-gray-700">
                Venues
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{venue.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Photo Gallery Placeholder */}
              <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mb-6">
                <BuildingOfficeIcon className="w-24 h-24 text-primary-600" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>{venue.address}, {venue.city}, {venue.state}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  {venue.rating && (
                    <div className="flex items-center mb-1">
                      {renderStars(venue.rating)}
                      <span className="ml-2 text-lg font-semibold">{venue.rating}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    {venue.totalReviews} reviews
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{venue.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {venue.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venue.courts.map((court) => (
                  <div
                    key={court.id}
                    className={`border-2 rounded-lg p-4 transition-colors cursor-pointer ${
                      selectedCourt === court.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCourt(court.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{court.name}</h3>
                        <p className="text-sm text-gray-600">{court.sport}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{court.pricePerHour}</p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>
                        {court.openTime.toString().padStart(2, '0')}:00 - 
                        {court.closeTime.toString().padStart(2, '0')}:00
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookCourt(court.id);
                      }}
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      Book This Court
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Reviews ({venue.totalReviews})
              </h2>
              
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <UserIcon className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{review.userName}</p>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 ml-11">{review.comment}</p>
                  </div>
                ))}
              </div>

              {session && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Book */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Book</h3>
                
                {selectedCourt ? (
                  <div className="space-y-4">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <h4 className="font-medium text-primary-900">
                        {venue.courts.find(c => c.id === selectedCourt)?.name}
                      </h4>
                      <p className="text-sm text-primary-700">
                        {venue.courts.find(c => c.id === selectedCourt)?.sport}
                      </p>
                      <p className="text-lg font-semibold text-primary-900 mt-2">
                        ₹{venue.courts.find(c => c.id === selectedCourt)?.pricePerHour}/hr
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleBookCourt(selectedCourt)}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Book Now
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    Select a court to book
                  </p>
                )}
              </div>

              {/* Owner Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Owner</h3>
                <div className="flex items-center">
                  <UserIcon className="w-12 h-12 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{venue.owner.name}</p>
                    {venue.owner.businessName && (
                      <p className="text-sm text-gray-600">{venue.owner.businessName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact/Support */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Have questions about booking or the facility?
                </p>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
