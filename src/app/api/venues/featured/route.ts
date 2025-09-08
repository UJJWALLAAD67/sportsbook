import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get featured venues (approved venues with high ratings or recent activity)
    const featuredVenues = await prisma.venue.findMany({
      where: {
        approved: true,
      },
      include: {
        courts: {
          select: {
            sport: true,
            pricePerHour: true,
            currency: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      take: 6,
    });

    // Transform the data to include computed fields
    const transformedVenues = featuredVenues.map((venue) => {
      // Calculate average rating
      const avgRating =
        venue.reviews.length > 0
          ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) /
            venue.reviews.length
          : 0;

      // Get unique sports
      const sports = [...new Set(venue.courts.map((court) => court.sport))];

      // Get minimum price per hour
      const minPrice =
        venue.courts.length > 0
          ? Math.min(...venue.courts.map((court) => court.pricePerHour))
          : 0;

      // Generate tags based on venue data
      const tags = [];
      if (avgRating >= 4.5) tags.push("Top Rated");
      if (minPrice < 100000) tags.push("Budget Friendly"); // Less than ₹1000
      if (venue.amenities.includes("Parking")) tags.push("Parking");
      if (venue.amenities.includes("Lighting")) tags.push("Night Play");

      return {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        description: venue.description,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: venue._count.reviews,
        sports,
        minPricePerHour: minPrice,
        currency: venue.courts[0]?.currency || "INR",
        amenities: venue.amenities,
        photos: venue.photos,
        tags: tags.slice(0, 3), // Limit to 3 tags
      };
    });

    return NextResponse.json(transformedVenues);
  } catch (error) {
    console.error("Error fetching featured venues:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured venues" },
      { status: 500 }
    );
  }
}
