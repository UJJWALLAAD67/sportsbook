import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const venueId = parseInt(resolvedParams.id);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    const venue = await prisma.venue.findUnique({
      where: {
        id: venueId,
        approved: true,
      },
      include: {
        owner: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        courts: {
          orderBy: {
            name: "asc",
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Calculate average rating
    const avgRating =
      venue.reviews.length > 0
        ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) /
          venue.reviews.length
        : 0;

    // Get unique sports
    const sports = [...new Set(venue.courts.map((court) => court.sport))];

    // Get price range
    const prices = venue.courts.map((court) => court.pricePerHour);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Get operating hours
    const openTimes = venue.courts.map((court) => court.openTime);
    const closeTimes = venue.courts.map((court) => court.closeTime);
    const earliestOpen = openTimes.length > 0 ? Math.min(...openTimes) : 6;
    const latestClose = closeTimes.length > 0 ? Math.max(...closeTimes) : 22;

    // Transform data
    const transformedVenue = {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      description: venue.description,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      country: venue.country,
      latitude: venue.latitude,
      longitude: venue.longitude,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: venue._count.reviews,
      sports,
      minPrice,
      maxPrice,
      currency: venue.courts[0]?.currency || "INR",
      operatingHours: {
        open: earliestOpen,
        close: latestClose,
      },
      amenities: venue.amenities,
      photos: venue.photos,
      courts: venue.courts.map((court) => ({
        id: court.id,
        name: court.name,
        sport: court.sport,
        pricePerHour: court.pricePerHour,
        currency: court.currency,
        openTime: court.openTime,
        closeTime: court.closeTime,
      })),
      reviews: venue.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          name: review.user.fullName,
          avatar: review.user.avatarUrl,
        },
      })),
      owner: {
        name: venue.owner.user.fullName,
        businessName: venue.owner.businessName,
        phone: venue.owner.phone,
      },
    };

    return NextResponse.json(transformedVenue);
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { error: "Failed to fetch venue" },
      { status: 500 }
    );
  }
}
