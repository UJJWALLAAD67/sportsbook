import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get popular sports based on venue count and bookings
    const sportsData = await prisma.court.groupBy({
      by: ['sport'],
      where: {
        venue: {
          approved: true
        }
      },
      _count: {
        sport: true
      },
      orderBy: {
        _count: {
          sport: 'desc'
        }
      }
    });

    // Map sports to display format with images
    const sportImageMap: Record<string, string> = {
      'Badminton': '/sports/badminton.jpg',
      'Football': '/sports/football.jpg', 
      'Cricket': '/sports/cricket.jpg',
      'Tennis': '/sports/tennis.jpg',
      'Basketball': '/sports/basketball.jpg',
      'Table Tennis': '/sports/table-tennis.jpg',
      'Volleyball': '/sports/volleyball.jpg',
      'Squash': '/sports/squash.jpg'
    };

    const popularSports = sportsData.map(sport => ({
      name: sport.sport,
      venueCount: sport._count.sport,
      image: sportImageMap[sport.sport] || '/sports/default.jpg'
    }));

    // If no sports in database, return default popular sports
    if (popularSports.length === 0) {
      return NextResponse.json([
        { name: "Badminton", venueCount: 0, image: "/sports/badminton.jpg" },
        { name: "Football", venueCount: 0, image: "/sports/football.jpg" },
        { name: "Cricket", venueCount: 0, image: "/sports/cricket.jpg" },
        { name: "Tennis", venueCount: 0, image: "/sports/tennis.jpg" }
      ]);
    }

    return NextResponse.json(popularSports);
  } catch (error) {
    console.error("Error fetching popular sports:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular sports" },
      { status: 500 }
    );
  }
}
