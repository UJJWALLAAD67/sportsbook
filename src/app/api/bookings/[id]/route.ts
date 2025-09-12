// API route to fetch individual booking details for authenticated users
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Get booking with all related data
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id
      },
      include: {
        court: {
          include: {
            Venue: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true
          }
        },
        User: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Transform booking data
    const transformedBooking = {
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      totalAmount: booking.payment?.amount || 0,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      court: {
        id: booking.court.id,
        name: booking.court.name,
        sport: booking.court.sport,
        pricePerHour: booking.court.pricePerHour,
        Venue: {
          id: booking.court.Venue.id,
          name: booking.court.Venue.name,
          address: booking.court.Venue.address,
          city: booking.court.Venue.city,
          state: booking.court.Venue.state
        }
      },
      payment: booking.payment ? {
        id: booking.payment.id,
        status: booking.payment.status,
        amount: booking.payment.amount,
        paymentMethod: booking.payment.paymentMethod
      } : null,
      user: {
        id: booking.User.id,
        fullName: booking.User.fullName,
        email: booking.User.email
      }
    };

    return NextResponse.json(transformedBooking);

  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error("Booking fetch error:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}