import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("Search Params:", searchParams.toString());

    // Parse query parameters
    const search = searchParams.get("search") || "";
    const sport = searchParams.get("sport") || "";
    const city = searchParams.get("city") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const rating = searchParams.get("rating");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build where clause
    const where: Prisma.VenueWhereInput = {
      approved: true,
      AND: [],
    };

    // Search filter
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // City filter
    if (city) {
      where.AND.push({
        city: { equals: city, mode: "insensitive" },
      });
    }

    // Sport filter
    if (sport) {
      where.AND.push({
        courts: {
          some: {
            sport: { equals: sport, mode: "insensitive" },
          },
        },
      });
    }

    // Price filter
    if (minPrice || maxPrice) {
      const priceFilter: Prisma.IntFilter = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice);

      where.AND.push({
        courts: {
          some: {
            pricePerHour: priceFilter,
          },
        },
      });
    }

    // Rating filter
    if (rating) {
      where.AND.push({
        rating: {
          gte: parseFloat(rating),
        },
      });
    }
    console.log("Prisma Where Clause:", JSON.stringify(where, null, 2));

    // Calculate offset
    const skip = (page - 1) * limit;

    // Build order by clause
    let orderBy: Prisma.VenueOrderByWithRelationInput = {};
    switch (sortBy) {
      case "price":
        orderBy = {
          courts: {
            _min: {
              pricePerHour: sortOrder as "asc" | "desc",
            },
          },
        };
        break;
      case "rating":
        orderBy = { rating: sortOrder as "asc" | "desc" };
        break;
      case "name":
      default:
        orderBy = { name: sortOrder as "asc" | "desc" };
        break;
    }

    // Get venues with related data
    const [venues, totalCount] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          courts: {
            select: {
              id: true,
              name: true,
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
        skip,
        take: limit,
        orderBy,
      }),
      prisma.venue.count({ where }),
    ]);
    console.log("Venues from DB:", venues.length);

    // Transform venues with computed fields
    let transformedVenues = venues.map((venue) => {
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
      const minPricePerHour = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPricePerHour = prices.length > 0 ? Math.max(...prices) : 0;

      // Generate tags
      const tags = [];
      if (avgRating >= 4.5) tags.push("Top Rated");
      if (minPricePerHour < 1000) tags.push("Budget Friendly"); // Less than ₹1000
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
        minPricePerHour,
        maxPricePerHour,
        currency: venue.courts[0]?.currency || "INR",
        amenities: venue.amenities,
        image: venue.image || null,
        tags: tags.slice(0, 3),
        courts: venue.courts,
      };
    });

    // Get available filters for the sidebar
    const [allCities, allSports] = await Promise.all([
      prisma.venue.findMany({
        where: { approved: true },
        select: { city: true },
        distinct: ["city"],
      }),
      prisma.court.findMany({
        where: { venue: { approved: true } },
        select: { sport: true },
        distinct: ["sport"],
      }),
    ]);

    const filters = {
      cities: allCities.map((v) => v.city).sort(),
      sports: allSports.map((c) => c.sport).sort(),
    };

    return NextResponse.json({
      venues: transformedVenues,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      filters,
    });
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
