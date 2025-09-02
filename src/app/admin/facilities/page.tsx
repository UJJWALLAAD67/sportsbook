"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  EyeIcon,
  ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/outline";

interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  amenities: string[];
  photos: string[];
  approved: boolean;
  owner: {
    id: number;
    fullName: string;
    email: string;
    businessName?: string;
  };
  courts: Array<{
    id: number;
    name: string;
    sport: string;
    pricePerHour: number;
    openTime: number;
    closeTime: number;
  }>;
  createdAt: string;
}

interface ApprovalAction {
  venueId: number;
  action: "approve" | "reject";
  comments?: string;
}

export default function FacilityApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<{ venueId: number; action: "approve" | "reject" } | null>(null);
  const [comments, setComments] = useState("");
  
  // Mock data - replace with actual API call
  const mockVenues: Venue[] = [
    {
      id: 3,
      name: "Football Ground Central",
      description: "Full-sized football ground with synthetic turf and floodlights. Perfect for 11v11 matches and training sessions.",
      address: "789 Field Road",
      city: "Mumbai",
      state: "Maharashtra", 
      country: "India",
      amenities: ["Parking", "Lighting", "Changing Rooms", "Shower"],
      photos: [],
      approved: false,
      owner: {
        id: 3,
        fullName: "Vikram Patel",
        email: "vikram@example.com",
        businessName: "Central Sports Ltd"
      },
      courts: [
        {
          id: 5,
          name: "Main Field",
          sport: "Football",
          pricePerHour: 3000,
          openTime: 6,
          closeTime: 22
        }
      ],
      createdAt: "2024-03-01T09:00:00Z"
    },
    {
      id: 5,
      name: "Premium Squash Club",
      description: "State-of-the-art squash facility with 4 glass-backed courts and professional lighting.",
      address: "101 Squash Avenue", 
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      amenities: ["Parking", "Air Conditioning", "Equipment Rental", "Cafeteria", "Wi-Fi"],
      photos: [],
      approved: false,
      owner: {
        id: 5,
        fullName: "Anita Sharma",
        email: "anita@premiumsquash.com",
        businessName: "Premium Sports Facilities"
      },
      courts: [
        {
          id: 10,
          name: "Court 1",
          sport: "Squash",
          pricePerHour: 1800,
          openTime: 6,
          closeTime: 23
        },
        {
          id: 11,
          name: "Court 2", 
          sport: "Squash",
          pricePerHour: 1800,
          openTime: 6,
          closeTime: 23
        }
      ],
      createdAt: "2024-02-28T16:30:00Z"
    },
    {
      id: 7,
      name: "Volleyball Academy",
      description: "Indoor volleyball facility with 3 professional courts and training equipment.",
      address: "555 Volleyball Street",
      city: "Delhi",
      state: "Delhi",
      country: "India", 
      amenities: ["Parking", "Changing Rooms", "Equipment Rental", "Seating Area"],
      photos: [],
      approved: false,
      owner: {
        id: 7,
        fullName: "Ravi Kumar",
        email: "ravi@volleyballacademy.com"
      },
      courts: [
        {
          id: 15,
          name: "Court A",
          sport: "Volleyball",
          pricePerHour: 1500,
          openTime: 7,
          closeTime: 21
        },
        {
          id: 16,
          name: "Court B",
          sport: "Volleyball", 
          pricePerHour: 1500,
          openTime: 7,
          closeTime: 21
        }
      ],
      createdAt: "2024-02-26T11:45:00Z"
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
      setVenues(mockVenues.filter(v => !v.approved)); // Only show pending venues
      setIsLoading(false);
    }, 1000);
  }, [session, status, router]);

  const handleApprovalAction = async (venueId: number, action: "approve" | "reject", comments?: string) => {
    setIsProcessing(venueId);
    
    try {
      // TODO: Implement actual API call
      console.log(`${action} venue ${venueId}`, { comments });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove from pending list
      setVenues(prev => prev.filter(v => v.id !== venueId));
      setSelectedVenue(null);
      setShowCommentModal(null);
      setComments("");
    } catch (error) {
      console.error(`Failed to ${action} venue:`, error);
    } finally {
      setIsProcessing(null);
    }
  };

  const openCommentModal = (venueId: number, action: "approve" | "reject") => {
    setShowCommentModal({ venueId, action });
    setComments("");
  };

  const submitWithComments = () => {
    if (showCommentModal) {
      handleApprovalAction(showCommentModal.venueId, showCommentModal.action, comments);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Facility Approvals</h1>
          <p className="text-gray-600 mt-2">
            Review and approve new venue registrations ({venues.length} pending)
          </p>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900">All caught up!</h3>
            <p className="mt-1 text-gray-500">
              There are no pending facility approvals at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Venues List */}
            <div className="space-y-6">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer border-2 transition-all ${
                    selectedVenue?.id === venue.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-transparent hover:shadow-md"
                  }`}
                  onClick={() => setSelectedVenue(venue)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-8 h-8 text-primary-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                        <p className="text-sm text-gray-600">{venue.courts.length} court(s)</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{venue.address}, {venue.city}</span>
                  </div>

                  {/* Owner Info */}
                  <div className="flex items-center text-gray-600 mb-4">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{venue.owner.fullName}</span>
                    {venue.owner.businessName && (
                      <span className="text-sm text-gray-500 ml-2">({venue.owner.businessName})</span>
                    )}
                  </div>

                  {/* Sports offered */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[...new Set(venue.courts.map(c => c.sport))].map(sport => (
                      <span key={sport} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sport}
                      </span>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCommentModal(venue.id, "approve");
                      }}
                      disabled={isProcessing === venue.id}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      {isProcessing === venue.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCommentModal(venue.id, "reject");
                      }}
                      disabled={isProcessing === venue.id}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      <XMarkIcon className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed View */}
            <div className="sticky top-8">
              {selectedVenue ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Venue Details</h2>
                    <button
                      onClick={() => setSelectedVenue(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Venue Info */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{selectedVenue.name}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{selectedVenue.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Address:</span>
                          <p className="text-gray-600 mt-1">
                            {selectedVenue.address}<br />
                            {selectedVenue.city}, {selectedVenue.state}<br />
                            {selectedVenue.country}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Owner:</span>
                          <p className="text-gray-600 mt-1">
                            {selectedVenue.owner.fullName}<br />
                            {selectedVenue.owner.email}
                            {selectedVenue.owner.businessName && (
                              <><br />{selectedVenue.owner.businessName}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Courts */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Courts ({selectedVenue.courts.length})</h4>
                      <div className="space-y-3">
                        {selectedVenue.courts.map((court) => (
                          <div key={court.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">{court.name}</h5>
                                <p className="text-sm text-gray-600">{court.sport}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">₹{court.pricePerHour}</p>
                                <p className="text-xs text-gray-500">per hour</p>
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              <span>
                                {court.openTime.toString().padStart(2, '0')}:00 - 
                                {court.closeTime.toString().padStart(2, '0')}:00
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedVenue.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center text-sm">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photos Placeholder */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Photos</h4>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <BuildingOfficeIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">No photos uploaded</p>
                      </div>
                    </div>

                    {/* Submission Date */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Submitted:</span>{" "}
                        {new Date(selectedVenue.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => openCommentModal(selectedVenue.id, "approve")}
                        disabled={isProcessing === selectedVenue.id}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Approve Venue
                      </button>
                      <button
                        onClick={() => openCommentModal(selectedVenue.id, "reject")}
                        disabled={isProcessing === selectedVenue.id}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 mr-2" />
                        Reject Venue
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Venue</h3>
                  <p className="mt-2 text-gray-500">
                    Click on a venue from the list to view detailed information and take action.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center mb-4">
                  <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {showCommentModal.action === "approve" ? "Approve Venue" : "Reject Venue"}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {showCommentModal.action === "approve" 
                    ? "Add any comments or instructions for the venue owner (optional):"
                    : "Please provide a reason for rejection to help the owner improve:"
                  }
                </p>
                
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={showCommentModal.action === "approve"
                    ? "Great facility! Welcome to SportsBook..."
                    : "Please improve the following areas..."
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCommentModal(null);
                      setComments("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitWithComments}
                    disabled={isProcessing === showCommentModal.venueId}
                    className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                      showCommentModal.action === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isProcessing === showCommentModal.venueId 
                      ? "Processing..." 
                      : showCommentModal.action === "approve" 
                        ? "Approve" 
                        : "Reject"
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
