"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  StarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number | null;
  photos: string[];
  courts: Array<{
    id: number;
    name: string;
    sport: string;
    pricePerHour: number;
  }>;
  minPrice: number;
  maxPrice: number;
  sports: string[];
}

interface Filters {
  search: string;
  sport: string;
  minPrice: number;
  maxPrice: number;
  city: string;
  rating: number;
}

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const venuesPerPage = 9;

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") || "",
    sport: searchParams.get("sport") || "",
    minPrice: 0,
    maxPrice: 10000,
    city: "",
    rating: 0,
  });

  // Mock data - replace with actual API call
  const mockVenues: Venue[] = [
    {
      id: 1,
      name: "Elite Sports Complex",
      description:
        "Premium badminton facility with 6 professional courts, air conditioning, and modern amenities",
      address: "123 Sports Street, Andheri West",
      city: "Mumbai",
      rating: 4.8,
      photos: [],
      courts: [
        { id: 1, name: "Court 1", sport: "Badminton", pricePerHour: 1200 },
        { id: 2, name: "Court 2", sport: "Badminton", pricePerHour: 1200 },
        { id: 3, name: "Court 3", sport: "Badminton", pricePerHour: 1200 },
      ],
      minPrice: 1200,
      maxPrice: 1200,
      sports: ["Badminton"],
    },
    {
      id: 2,
      name: "Tennis Arena Pro",
      description:
        "Professional tennis courts with night lighting and synthetic surface",
      address: "456 Tennis Ave, Bandra",
      city: "Mumbai",
      rating: 4.6,
      photos: [],
      courts: [
        { id: 4, name: "Court A", sport: "Tennis", pricePerHour: 2000 },
        { id: 5, name: "Court B", sport: "Tennis", pricePerHour: 2500 },
      ],
      minPrice: 2000,
      maxPrice: 2500,
      sports: ["Tennis"],
    },
    {
      id: 3,
      name: "Multi-Sport Hub",
      description:
        "Complete sports facility with badminton, basketball, and volleyball courts",
      address: "789 Games Road, Powai",
      city: "Mumbai",
      rating: 4.4,
      photos: [],
      courts: [
        { id: 6, name: "Badminton 1", sport: "Badminton", pricePerHour: 1000 },
        {
          id: 7,
          name: "Basketball Court",
          sport: "Basketball",
          pricePerHour: 1500,
        },
        {
          id: 8,
          name: "Volleyball Court",
          sport: "Volleyball",
          pricePerHour: 1200,
        },
      ],
      minPrice: 1000,
      maxPrice: 1500,
      sports: ["Badminton", "Basketball", "Volleyball"],
    },
    {
      id: 4,
      name: "Football Ground Central",
      description:
        "Full-sized football ground with synthetic turf and floodlights",
      address: "321 Field Road, Malad",
      city: "Mumbai",
      rating: 4.2,
      photos: [],
      courts: [
        { id: 9, name: "Main Field", sport: "Football", pricePerHour: 3000 },
      ],
      minPrice: 3000,
      maxPrice: 3000,
      sports: ["Football"],
    },
    {
      id: 5,
      name: "Cricket Academy",
      description:
        "Professional cricket nets and practice facilities with coaching",
      address: "654 Cricket Lane, Thane",
      city: "Thane",
      rating: 4.7,
      photos: [],
      courts: [
        { id: 10, name: "Net 1", sport: "Cricket", pricePerHour: 800 },
        { id: 11, name: "Net 2", sport: "Cricket", pricePerHour: 800 },
        { id: 12, name: "Net 3", sport: "Cricket", pricePerHour: 800 },
      ],
      minPrice: 800,
      maxPrice: 800,
      sports: ["Cricket"],
    },
    {
      id: 6,
      name: "Table Tennis Center",
      description:
        "Indoor table tennis facility with 8 tables and air conditioning",
      address: "987 Ping Pong Street, Borivali",
      city: "Mumbai",
      rating: 4.1,
      photos: [],
      courts: [
        { id: 13, name: "Table 1", sport: "Table Tennis", pricePerHour: 600 },
        { id: 14, name: "Table 2", sport: "Table Tennis", pricePerHour: 600 },
      ],
      minPrice: 600,
      maxPrice: 600,
      sports: ["Table Tennis"],
    },
  ];

  useEffect(() => {
    // Simulate API loading
    setIsLoading(true);
    setTimeout(() => {
      setVenues(mockVenues);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter venues based on current filters
  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      filters.search === "" ||
      venue.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      venue.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      venue.city.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSport =
      filters.sport === "" ||
      venue.sports.some(
        (sport) => sport.toLowerCase() === filters.sport.toLowerCase()
      );

    const matchesPrice =
      venue.minPrice >= filters.minPrice && venue.maxPrice <= filters.maxPrice;

    const matchesCity =
      filters.city === "" ||
      venue.city.toLowerCase().includes(filters.city.toLowerCase());

    const matchesRating =
      filters.rating === 0 ||
      (venue.rating !== null && venue.rating >= filters.rating);

    return (
      matchesSearch &&
      matchesSport &&
      matchesPrice &&
      matchesCity &&
      matchesRating
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredVenues.length / venuesPerPage);
  const startIndex = (currentPage - 1) * venuesPerPage;
  const paginatedVenues = filteredVenues.slice(
    startIndex,
    startIndex + venuesPerPage
  );

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      sport: "",
      minPrice: 0,
      maxPrice: 10000,
      city: "",
      rating: 0,
    });
    setCurrentPage(1);
  };

  const uniqueCities = [...new Set(venues.map((venue) => venue.city))];
  const uniqueSports = [...new Set(venues.flatMap((venue) => venue.sports))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sports Venues</h1>
          <p className="text-gray-600 mt-2">
            Discover and book the best sports facilities in your area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search venues by name, location, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport
                  </label>
                  <select
                    value={filters.sport}
                    onChange={(e) =>
                      handleFilterChange("sport", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Sports</option>
                    {uniqueSports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) =>
                      handleFilterChange("rating", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₹/hr)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "minPrice",
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "maxPrice",
                          Number(e.target.value) || 10000
                        )
                      }
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>
              Showing {paginatedVenues.length} of {filteredVenues.length} venues
            </span>
            {Object.values(filters).some(
              (value) => value !== "" && value !== 0
            ) && <span>Filters applied</span>}
          </div>
        </div>

        {/* Venues Grid */}
        {paginatedVenues.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No venues found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or clearing filters
            </p>
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Venue Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-16 h-16 text-primary-600" />
                  </div>

                  <div className="p-6">
                    {/* Venue Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {venue.name}
                      </h3>
                      {venue.rating && (
                        <div className="flex items-center ml-2">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {venue.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {venue.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{venue.address}</span>
                    </div>

                    {/* Sports Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {venue.sports.map((sport) => (
                        <span
                          key={sport}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>

                    {/* Price Range */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-sm">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="font-medium text-gray-900">
                          ₹{venue.minPrice}
                          {venue.minPrice !== venue.maxPrice &&
                            ` - ₹${venue.maxPrice}`}
                        </span>
                        <span className="text-gray-500 ml-1">/hr</span>
                      </div>

                      <Link
                        href={`/venues/${venue.id}`}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          page === currentPage
                            ? "bg-primary-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
