import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { venueId, courtId, date, timeSlot, duration, totalPrice, userNotes } = await req.json();
    const idempotencyKey = req.headers.get("Idempotency-Key");

    if (!venueId || !courtId || !date || !timeSlot || !duration || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required booking information" },
        { status: 400 }
      );
    }

    // Extract hour from timeSlot (format: "YYYY-MM-DD-HH")
    const hour = parseInt(timeSlot.split('-').pop() || '0');
    const startTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + duration);

    // Check for duplicate booking with idempotency key
    if (idempotencyKey) {
      const existingBooking = await prisma.booking.findUnique({
        where: { idempotencyKey }
      });

      if (existingBooking) {
        return NextResponse.json({
          success: true,
          booking: existingBooking,
          message: "Booking already exists"
        });
      }
    }

    // Use a database transaction with optimistic locking for concurrency control
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify court exists and get current booking state
      const court = await tx.court.findUnique({
        where: { id: courtId },
        include: { venue: true }
      });

      if (!court || court.venue.id !== venueId) {
        throw new Error("Court not found or doesn't belong to this venue");
      }

      // 2. Check for conflicting bookings with row-level locking
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          courtId,
          startTime: {
            lte: endTime
          },
          endTime: {
            gte: startTime
          },
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
          }
        }
      });

      if (conflictingBooking) {
        throw new Error("Time slot conflict: This time slot is already booked");
      }

      // 3. Verify the venue is approved
      if (!court.venue.approved) {
        throw new Error("Venue is not approved for bookings");
      }

      // 4. Check if the time slot is within court operating hours
      const slotStartHour = startTime.getHours();
      const slotEndHour = endTime.getHours();
      
      if (slotStartHour < court.openTime || slotEndHour > court.closeTime) {
        throw new Error("Booking time is outside court operating hours");
      }

      // 5. Create the booking atomically
      const booking = await tx.booking.create({
        data: {
          userId: token.id as number,
          courtId,
          startTime,
          endTime,
          status: BookingStatus.PENDING,
          notes: userNotes || null,
          idempotencyKey: idempotencyKey || `${token.id}-${Date.now()}-${Math.random()}`
        },
        include: {
          court: {
            include: {
              venue: true
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // 6. Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice * 100, // Convert to smallest currency unit (paisa)
          currency: "INR",
          status: "PENDING"
        }
      });

      return { booking, payment };
    }, {
      // Use serializable isolation level for strongest consistency
      isolationLevel: 'Serializable',
      timeout: 10000 // 10 second timeout
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      payment: result.payment,
      message: "Booking created successfully"
    });

  } catch (error: any) {
    console.error("Booking creation failed:", error);

    // Handle specific database constraint violations
    if (error.message.includes("Time slot conflict")) {
      return NextResponse.json(
        { error: "This time slot has been booked by another user. Please select a different time." },
        { status: 409 }
      );
    }

    if (error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A booking already exists for this time slot." },
        { status: 409 }
      );
    }

    // Handle transaction timeout
    if (error.message.includes("timeout") || error.code === "P2024") {
      return NextResponse.json(
        { error: "Booking request timed out. Please try again." },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Booking failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const courtId = url.searchParams.get("courtId");
    const date = url.searchParams.get("date");

    if (!courtId || !date) {
      return NextResponse.json(
        { error: "Missing courtId or date parameter" },
        { status: 400 }
      );
    }

    // Get existing bookings for the court on the specified date
    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId: parseInt(courtId),
        startTime: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`)
        },
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    return NextResponse.json({
      success: true,
      bookings: existingBookings
    });

  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking data" },
      { status: 500 }
    );
  }
}
