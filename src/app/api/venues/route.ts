import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

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
    const where: any = {
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
          { city: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // City filter
    if (city) {
      where.AND.push({
        city: { contains: city, mode: "insensitive" },
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
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice) * 100; // Convert to paisa
      if (maxPrice) priceFilter.lte = parseInt(maxPrice) * 100; // Convert to paisa

      where.AND.push({
        courts: {
          some: {
            pricePerHour: priceFilter,
          },
        },
      });
    }

    // Calculate offset
    const skip = (page - 1) * limit;

    // Build order by clause
    let orderBy: any = {};
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
        // We'll handle this after getting the data
        orderBy = { name: "asc" };
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
      if (minPricePerHour < 100000) tags.push("Budget Friendly");
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
        photos: venue.photos,
        tags: tags.slice(0, 3),
        courts: venue.courts,
      };
    });

    // Apply rating filter if specified
    if (rating) {
      const minRating = parseFloat(rating);
      transformedVenues = transformedVenues.filter(
        (venue) => venue.rating >= minRating
      );
    }

    // Sort by rating if specified
    if (sortBy === "rating") {
      transformedVenues.sort((a, b) => {
        return sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
      });
    }

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
