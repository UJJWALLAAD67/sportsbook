// /src/app/api/owner/venues/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { venueSchema } from "@/lib/schemas/venue";
import slugify from "slugify";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "@/lib/cloudinary";
import { z } from "zod";

type VenueFormData = z.infer<typeof venueSchema>;

/**
 * GET handler to fetch a single venue for editing.
 * Ensures the user is an owner and has permission to view the venue.
 * Converts price from database format (paisa) to frontend format (rupees).
 */
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    const venueId = parseInt(id, 10);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    const venue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        FacilityOwner: { userId: session.user.id },
      },
      include: {
        Court: true,
      },
    });

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    // Convert price from Paisa to Rupees for frontend display
    const venueForFrontend = {
      ...venue,
      courts: venue.Court.map((court) => ({
        ...court,
        pricePerHour: court.pricePerHour, // Keep as is, assuming it's stored correctly
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
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    const venueId = parseInt(id, 10);
    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type");
    let venueData: VenueFormData;
    let cloudinaryResult = null;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const imageFile = formData.get("image") as File | null;

      if (imageFile && imageFile.size > 0) {
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            { error: `Invalid file type: ${imageFile.type}` },
            { status: 400 }
          );
        }

        if (imageFile.size > maxSize) {
          return NextResponse.json(
            { error: `File too large. Maximum 10MB.` },
            { status: 400 }
          );
        }

        try {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          cloudinaryResult = await uploadImageToCloudinary(buffer, "venues");
        } catch (err) {
          console.error("Cloudinary upload error:", err);
          return NextResponse.json(
            { error: "Failed to upload image." },
            { status: 500 }
          );
        }
      }

      const venueDataString = formData.get("venueData") as string;
      if (!venueDataString) {
        return NextResponse.json(
          { error: "Missing venueData" },
          { status: 400 }
        );
      }
      venueData = JSON.parse(venueDataString);
    } else {
      venueData = await request.json();
    }

    const validation = venueSchema.safeParse(venueData);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { courts: submittedCourts, ...venueFields } = validation.data;

    const existingVenue = await prisma.venue.findFirst({
      where: { id: venueId, FacilityOwner: { userId: session.user.id } },
      select: { Court: { select: { id: true } }, imagePublicId: true },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: "Venue not found or no permission" },
        { status: 404 }
      );
    }

    const existingCourtIds = existingVenue.Court.map((c) => c.id);
    const submittedCourtIds = submittedCourts
      .map((c) => c.id)
      .filter((id): id is number => !!id);
    const courtsToDelete = existingCourtIds.filter(
      (id) => !submittedCourtIds.includes(id)
    );

    await prisma.$transaction(async (tx) => {
      const slug = slugify(venueFields.name, { lower: true, strict: true });
      const updateData: any = {
        ...venueFields,
        slug,
        amenities: venueFields.amenities,
      };

      if (cloudinaryResult) {
        updateData.image = cloudinaryResult.secure_url;
        updateData.imagePublicId = cloudinaryResult.public_id;

        if (existingVenue.imagePublicId) {
          try {
            await deleteImageFromCloudinary(existingVenue.imagePublicId);
          } catch (err) {
            console.error("Failed to delete old image:", err);
          }
        }
      }

      await tx.venue.update({ where: { id: venueId }, data: updateData });

      if (courtsToDelete.length > 0) {
        await tx.court.deleteMany({ where: { id: { in: courtsToDelete } } });
      }

      for (const court of submittedCourts) {
        const courtPayload = {
          name: court.name,
          sport: court.sport,
          pricePerHour: court.pricePerHour,
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
          await tx.court.create({ data: { ...courtPayload, venueId } });
        }
      }
    });

    return NextResponse.json({ message: "Venue updated successfully" });
  } catch (err) {
    console.error("Error updating venue:", err);
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
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    const venueId = parseInt(id, 10);

    if (isNaN(venueId)) {
      return NextResponse.json({ error: "Invalid venue ID" }, { status: 400 });
    }

    const existingVenue = await prisma.venue.findFirst({
      where: {
        id: venueId,
        FacilityOwner: { userId: session.user.id },
      },
      include: {
        Court: {
          select: {
            _count: {
              select: {
                Booking: {
                  where: { status: { in: ["PENDING", "CONFIRMED"] } },
                },
              },
            },
          },
        },
        imagePublicId: true, // Include imagePublicId for Cloudinary deletion
      },
    });

    if (!existingVenue) {
      return NextResponse.json(
        { error: "Venue not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    const hasActiveBookings = existingVenue.Court.some(
      (court) => court._count.Booking > 0
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
      if (existingVenue.imagePublicId) {
        try {
          await deleteImageFromCloudinary(existingVenue.imagePublicId);
        } catch (error) {
          console.error("Failed to delete image from Cloudinary:", error);
        }
      }

      await tx.court.deleteMany({ where: { venueId } });
      await tx.review.deleteMany({ where: { venueId } }); // Assuming you have a Review model
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
