import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== Role.OWNER) {
      return NextResponse.json(
        { error: "Unauthorized. Owner access required." },
        { status: 403 }
      );
    }

    const ownerId = token.id;

    // Find all venues owned by this owner
    const ownedVenues = await prisma.venue.findMany({
      where: { ownerId: ownerId },
      select: { id: true },
    });

    const ownedVenueIds = ownedVenues.map((venue) => venue.id);

    if (ownedVenueIds.length === 0) {
      return NextResponse.json([]); // No venues, so no bookings
    }

    const bookings = await prisma.booking.findMany({
      where: {
        Court: {
          venueId: {
            in: ownedVenueIds,
          },
        },
      },
      include: {
        User: {
          select: { fullName: true, email: true },
        },
        Court: {
          select: {
            name: true,
            sport: true,
            Venue: {
              select: { name: true },
            },
          },
        },
        Payment: {
          select: { amount: true, status: true },
        },
      },
      orderBy: { startTime: "desc" },
    });

    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: booking.status,
      user: {
        fullName: booking.User.fullName,
        email: booking.User.email,
      },
      Court: {
        name: booking.Court.name,
        sport: booking.Court.sport,
        Venue: {
          name: booking.Court.Venue.name,
        },
      },
      Payment: booking.Payment
        ? {
            amount: Number(booking.Payment.amount),
            status: booking.Payment.status,
          }
        : null,
    }));

    return NextResponse.json(transformedBookings);
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch owner bookings" },
      { status: 500 }
    );
  }
}
