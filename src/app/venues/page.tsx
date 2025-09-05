"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

// The Venue interface matches your future API response, including calculated fields.
interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number | null;
  photos: string[];
  amenities: string[];
  sports: string[];
  minPrice: number;
}

// Mock data that conforms to the schema-aligned Venue interface.
const allVenues: Venue[] = [
  {
    id: 1,
    name: "SRS Badminton Arena",
    description:
      "State-of-the-art indoor badminton facility with 8 synthetic courts.",
    address: "Vastrapur, Ahmedabad",
    city: "Ahmedabad",
    rating: 4.9,
    minPrice: 298,
    photos: ["/venues/venue-1.jpg"], // Replace with your image paths
    amenities: ["Indoor", "Parking", "Showers"],
    sports: ["Badminton"],
  },
  {
    id: 2,
    name: "Alpha Cricket Grounds",
    description:
      "Lush green outdoor cricket ground with well-maintained pitches.",
    address: "Bodakdev, Ahmedabad",
    city: "Ahmedabad",
    rating: 4.8,
    minPrice: 1200,
    photos: ["/venues/venue-2.jpg"],
    amenities: ["Outdoor", "Coaching", "Night Lights"],
    sports: ["Cricket"],
  },
  {
    id: 3,
    name: "SmashZone Tennis Club",
    description: "Premium tennis club featuring 4 high-quality clay courts.",
    address: "Navrangpura, Ahmedabad",
    city: "Ahmedabad",
    rating: 4.7,
    minPrice: 800,
    photos: ["/venues/venue-3.jpg"],
    amenities: ["Outdoor", "Clay Court", "Cafe"],
    sports: ["Tennis"],
  },
  {
    id: 4,
    name: "United 5-a-Side Football",
    description:
      "Modern artificial turf for exciting 5-a-side football matches.",
    address: "S.G. Highway, Ahmedabad",
    city: "Ahmedabad",
    rating: 4.9,
    minPrice: 1500,
    photos: ["/venues/venue-4.jpg"],
    amenities: ["Outdoor", "Night Lights", "Bibs Provided"],
    sports: ["Football"],
  },
];

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setVenues(allVenues);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter venues based on the search term
  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-20">Loading venues...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Sports Venues in Ahmedabad
          </h1>
          <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-500">
            Discover and Book Nearby Venues
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 ml-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a venue by name..."
              className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-3"
            />
          </div>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col group"
              >
                <div className="h-48 bg-gray-200">
                  {venue.photos && venue.photos.length > 0 && (
                    <img
                      src={venue.photos[0]}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{venue.name}</h3>
                    {venue.rating && (
                      <div className="flex items-center text-sm ml-2 flex-shrink-0">
                        <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                        {venue.rating}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1" /> {venue.address}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mt-2">
                    Starts from ₹{venue.minPrice} per hour
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {venue.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/venues/${venue.id}`}
                      className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">No Venues Found</h3>
            <p className="text-gray-500 mt-1">
              Try a different search term to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
