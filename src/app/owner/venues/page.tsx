"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  approved: boolean;
  rating: number | null;
  courts: Array<{
    id: number;
    name: string;
    sport: string;
    pricePerHour: number;
  }>;
  createdAt: string;
}

export default function OwnerVenuesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    // TODO: Fetch actual venues from API
    // For now, we'll use mock data
    setTimeout(() => {
      setVenues([
        {
          id: 1,
          name: "Elite Sports Complex",
          description: "Premium badminton facility with 6 courts",
          address: "123 Sports Street",
          city: "Mumbai",
          approved: true,
          rating: 4.8,
          courts: [
            { id: 1, name: "Court 1", sport: "Badminton", pricePerHour: 1200 },
            { id: 2, name: "Court 2", sport: "Badminton", pricePerHour: 1200 },
          ],
          createdAt: "2024-01-15"
        },
        {
          id: 2,
          name: "Tennis Arena Pro",
          description: "Professional tennis courts with night lighting",
          address: "456 Tennis Ave",
          city: "Mumbai",
          approved: true,
          rating: 4.6,
          courts: [
            { id: 3, name: "Court A", sport: "Tennis", pricePerHour: 2000 },
            { id: 4, name: "Court B", sport: "Tennis", pricePerHour: 2000 },
          ],
          createdAt: "2024-02-01"
        },
        {
          id: 3,
          name: "Football Ground Central",
          description: "Full-sized football ground with synthetic turf",
          address: "789 Field Road",
          city: "Mumbai",
          approved: false,
          rating: null,
          courts: [
            { id: 5, name: "Main Field", sport: "Football", pricePerHour: 3000 },
          ],
          createdAt: "2024-03-01"
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Venues</h1>
            <p className="text-gray-600 mt-2">
              Manage your sports facilities and courts
            </p>
          </div>
          <Link
            href="/owner/venues/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Venue
          </Link>
        </div>

        {/* Venues Grid */}
        {venues.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No venues yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first venue.</p>
            <div className="mt-6">
              <Link
                href="/owner/venues/new"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Venue
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Venue Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-16 h-16 text-primary-600" />
                </div>
                
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        venue.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {venue.approved ? "Approved" : "Pending Approval"}
                    </span>
                    {venue.rating && (
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{venue.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Venue Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{venue.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{venue.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {venue.address}, {venue.city}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {venue.courts.length} court{venue.courts.length > 1 ? "s" : ""} available
                  </div>

                  {/* Courts Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Courts:</h4>
                    <div className="space-y-1">
                      {venue.courts.slice(0, 2).map((court) => (
                        <div key={court.id} className="flex justify-between text-xs text-gray-600">
                          <span>{court.name} ({court.sport})</span>
                          <span>₹{court.pricePerHour}/hr</span>
                        </div>
                      ))}
                      {venue.courts.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{venue.courts.length - 2} more courts
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Link
                      href={`/venues/${venue.id}`}
                      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    <div className="flex space-x-2">
                      <Link
                        href={`/owner/venues/${venue.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                      <button className="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
