import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { venueSchema } from "@/lib/schemas/venue";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";

/**
 * GET handler to fetch a single venue for editing.
 * Ensures the user is an owner and has permission to view the venue.
 * Converts price from database format (paisa) to frontend format (rupees).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const venueId = parseInt(id, 10);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner: { userId: session.user.id },
      },
      include: {
        courts: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    // Convert price from Paisa to Rupees
    const venueForFrontend = {
      ...venue,
      courts: venue.courts.map((court) => ({
        ...court,
        pricePerHour: court.pricePerHour / 100,
      })),
    };

    return NextResponse.json(venueForFrontend);
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { error: "Failed to fetch venue" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update a venue and its associated courts.
 * Validates input, ensures ownership, and handles courts CRUD in a transaction.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const venueId = parseInt(id, 10);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    // Check if request is FormData (with image) or JSON (without image)
    const contentType = request.headers.get('content-type');
    let venueData;
    let cloudinaryResult = null;

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData with image
      const formData = await request.formData();
      
      // Extract image file
      const imageFile = formData.get('image') as File;
      if (imageFile && imageFile.size > 0) {
        // Validate image
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB limit for Cloudinary

        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            { error: `Invalid file type: ${imageFile.type}. Only JPEG, PNG, and WebP are allowed.` },
            { status: 400 }
          );
        }

        if (imageFile.size > maxSize) {
          return NextResponse.json(
            { error: `File too large. Maximum size is 10MB.` },
            { status: 400 }
          );
        }

        try {
          // Upload to Cloudinary
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          cloudinaryResult = await uploadImageToCloudinary(buffer, 'venues');
        } catch (error) {
          console.error('Cloudinary upload error:', error);
          return NextResponse.json(
            { error: 'Failed to upload image. Please try again.' },
            { status: 500 }
          );
        }
      }

      // Parse venue data from FormData
      const venueDataString = formData.get('venueData') as string;
      venueData = JSON.parse(venueDataString);
    } else {
      // Handle regular JSON request (backward compatibility)
      venueData = await request.json();
    }

    const validation = venueSchema.safeParse(venueData);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { courts: submittedCourts, ...venueData } = validation.data;

    const existingVenue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner: { userId: session.user.id },
      },
      select: { 
        courts: { select: { id: true } },
        imagePublicId: true // Get current image public_id for deletion if needed
      },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    const existingCourtIds = existingVenue.courts.map((c) => c.id);
    const submittedCourtIds = submittedCourts
      .map((c) => c.id)
      .filter((id): id is number => !!id);
    const courtsToDelete = existingCourtIds.filter(
      (id) => !submittedCourtIds.includes(id)
    );

    await prisma.$transaction(async (tx) => {
      // Prepare venue update data
      const updateData: any = {
        name: venueData.name,
        description: venueData.description,
        address: venueData.address,
        city: venueData.city,
        state: venueData.state,
        country: venueData.country,
        amenities: venueData.amenities,
      };

      // If new image is uploaded, update image fields and delete old image
      if (cloudinaryResult) {
        updateData.image = cloudinaryResult.secure_url;
        updateData.imagePublicId = cloudinaryResult.public_id;
        
        // Delete old image from Cloudinary if it exists
        if (existingVenue.imagePublicId) {
          try {
            await deleteImageFromCloudinary(existingVenue.imagePublicId);
          } catch (error) {
            console.error('Failed to delete old image from Cloudinary:', error);
            // Continue with update even if old image deletion fails
          }
        }
      }

      await tx.venue.update({
        where: { id: venueId },
        data: updateData,
      });

      if (courtsToDelete.length > 0) {
        await tx.court.deleteMany({
          where: { id: { in: courtsToDelete } },
        });
      }

      for (const court of submittedCourts) {
        const courtPayload = {
          name: court.name,
          sport: court.sport,
          pricePerHour: Math.round(court.pricePerHour * 100),
          currency: court.currency,
          openTime: court.openTime,
          closeTime: court.closeTime,
        };

        if (court.id) {
          await tx.court.update({
            where: { id: court.id },
            data: courtPayload,
          });
        } else {
          await tx.court.create({
            data: { ...courtPayload, venueId },
          });
        }
      }
    });

    return NextResponse.json({ message: "Venue updated successfully" });
  } catch (error) {
    console.error("Error updating venue:", error);
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a venue.
 * Checks ownership and prevents deletion if there are active bookings.
 * Also deletes associated image from Cloudinary.
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const venueId = parseInt(id, 10);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    const existingVenue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        owner: { userId: session.user.id },
      },
      include: {
        courts: {
          select: {
            _count: {
              select: {
                bookings: {
                  where: { status: { in: ["PENDING", "CONFIRMED"] } },
                },
              },
            },
          },
        },
      },
      // Include imagePublicId for Cloudinary deletion
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    const hasActiveBookings = existingVenue.courts.some(
      (court) => court._count.bookings > 0
    );

    if (hasActiveBookings) {
      return NextResponse.json(
        {
          error:
            "Cannot delete venue with active bookings. Please wait for all bookings to complete or be cancelled.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete associated image from Cloudinary if it exists
      if (existingVenue.imagePublicId) {
        try {
          await deleteImageFromCloudinary(existingVenue.imagePublicId);
        } catch (error) {
          console.error('Failed to delete image from Cloudinary:', error);
          // Continue with venue deletion even if image deletion fails
        }
      }

      await tx.court.deleteMany({ where: { venueId } });
      await tx.review.deleteMany({ where: { venueId } });
      await tx.venue.delete({ where: { id: venueId } });
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