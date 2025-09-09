import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    // Check if user is admin
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Get pending venues with owner information and courts
    const pendingVenues = await prisma.venue.findMany({
      where: { approved: false },
      include: {
        owner: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        courts: {
          select: {
            id: true,
            name: true,
            sport: true,
            pricePerHour: true,
            currency: true,
            openTime: true,
            closeTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedVenues = pendingVenues.map(venue => ({
      id: venue.id,
      name: venue.name,
      description: venue.description,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      country: venue.country,
      amenities: venue.amenities,
      photos: venue.photos,
      approved: venue.approved,
      owner: {
        id: venue.owner.user.id,
        fullName: venue.owner.user.fullName,
        email: venue.owner.user.email,
        businessName: venue.owner.businessName || undefined
      },
      courts: venue.courts.map(court => ({
        id: court.id,
        name: court.name,
        sport: court.sport,
        pricePerHour: Math.round(court.pricePerHour / 100), // Convert from paisa to rupees
        currency: court.currency,
        openTime: court.openTime,
        closeTime: court.closeTime
      })),
      createdAt: venue.createdAt.toISOString()
    }));

    return NextResponse.json(transformedVenues);

  } catch (error) {
    console.error("Error fetching admin facilities:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending facilities" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });
    
    // Check if user is admin
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { venueId, action, comments } = await req.json();

    if (!venueId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. venueId and action (approve/reject) are required." },
        { status: 400 }
      );
    }

    // Get the venue with owner information
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        owner: {
          include: {
            user: true
          }
        }
      }
    });

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    if (venue.approved) {
      return NextResponse.json(
        { error: "Venue is already approved" },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve the venue
      await prisma.venue.update({
        where: { id: venueId },
        data: { approved: true }
      });

      // Here you could send a notification email to the owner
      // await sendMail(
      //   venue.owner.user.email,
      //   "Venue Approved - SportsBook",
      //   `Your venue "${venue.name}" has been approved and is now live on SportsBook!`
      // );

      return NextResponse.json({
        success: true,
        message: "Venue approved successfully",
        action: 'approve'
      });

    } else if (action === 'reject') {
      // For rejection, you might want to keep the venue but mark it differently
      // or delete it entirely. For now, let's just delete it.
      await prisma.venue.delete({
        where: { id: venueId }
      });

      // Here you could send a rejection email to the owner with comments
      // await sendMail(
      //   venue.owner.user.email,
      //   "Venue Application Update - SportsBook",
      //   `Your venue application for "${venue.name}" has been reviewed. ${comments ? `Feedback: ${comments}` : ''}`
      // );

      return NextResponse.json({
        success: true,
        message: "Venue rejected and removed",
        action: 'reject'
      });
    }

  } catch (error) {
    console.error("Error processing facility approval:", error);
    return NextResponse.json(
      { error: "Failed to process facility approval" },
      { status: 500 }
    );
  }
}
