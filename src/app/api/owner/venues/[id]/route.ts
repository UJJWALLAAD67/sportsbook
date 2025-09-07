import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const venueId = parseInt(resolvedParams.id);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    // Get the venue with owner check
    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner: {
          userId: session.user.id
        }
      },
      include: {
        courts: true,
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
        }
      }
    });

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { error: "Failed to fetch venue" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const venueId = parseInt(resolvedParams.id);
    const body = await request.json();

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    // Check if the venue belongs to the owner
    const existingVenue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner: {
          userId: session.user.id
        }
      }
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    // Update venue in a transaction
    const updatedVenue = await prisma.$transaction(async (tx) => {
      // Update venue details
      const venue = await tx.venue.update({
        where: { id: venueId },
        data: {
          name: body.name,
          description: body.description,
          address: body.address,
          city: body.city,
          state: body.state,
          country: body.country,
          amenities: body.amenities,
          latitude: body.latitude,
          longitude: body.longitude,
        },
        include: {
          courts: true
        }
      });

      // Delete existing courts that are not in the update
      const existingCourtIds = venue.courts.map(c => c.id);
      const newCourtIds = body.courts.filter((c: { id?: number }) => c.id).map((c: { id: number }) => c.id);
      const courtsToDelete = existingCourtIds.filter(id => !newCourtIds.includes(id));
      
      if (courtsToDelete.length > 0) {
        await tx.court.deleteMany({
          where: { id: { in: courtsToDelete } }
        });
      }

      // Update existing courts and create new ones
      for (const court of body.courts as Array<{
        id?: number;
        name: string;
        sport: string;
        pricePerHour: number;
        currency: string;
        openTime: number;
        closeTime: number;
      }>) {
        if (court.id) {
          // Update existing court
          await tx.court.update({
            where: { id: court.id },
            data: {
              name: court.name,
              sport: court.sport,
              pricePerHour: court.pricePerHour,
              currency: court.currency,
              openTime: court.openTime,
              closeTime: court.closeTime,
            }
          });
        } else {
          // Create new court
          await tx.court.create({
            data: {
              venueId: venue.id,
              name: court.name,
              sport: court.sport,
              pricePerHour: court.pricePerHour,
              currency: court.currency,
              openTime: court.openTime,
              closeTime: court.closeTime,
            }
          });
        }
      }

      // Return updated venue with courts
      return await tx.venue.findUnique({
        where: { id: venueId },
        include: {
          courts: true
        }
      });
    });

    return NextResponse.json(updatedVenue);
  } catch (error) {
    console.error("Error updating venue:", error);
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const venueId = parseInt(resolvedParams.id);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    // Check if the venue belongs to the owner
    const existingVenue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner: {
          userId: session.user.id
        }
      },
      include: {
        courts: {
          include: {
            _count: {
              select: {
                bookings: {
                  where: {
                    status: {
                      in: ["PENDING", "CONFIRMED"]
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Check for active bookings
    const hasActiveBookings = existingVenue.courts.some(
      court => court._count.bookings > 0
    );

    if (hasActiveBookings) {
      return NextResponse.json(
        { error: "Cannot delete venue with active bookings. Please wait for all bookings to complete or be cancelled." },
        { status: 400 }
      );
    }

    // Delete venue (cascade will handle courts and related data)
    await prisma.venue.delete({
      where: { id: venueId }
    });

    return NextResponse.json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error("Error deleting venue:", error);
    return NextResponse.json(
      { error: "Failed to delete venue" },
      { status: 500 }
    );
  }
}