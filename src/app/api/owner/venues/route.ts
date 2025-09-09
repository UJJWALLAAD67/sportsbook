// /src/app/api/owner/venues/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import slugify from "slugify";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { venueSchema } from "@/lib/schemas/venue"; 
import { uploadImageToCloudinary } from "@/lib/cloudinary";
// A server-side Zod schema for validation


// GET /api/owner/venues
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const owner = await prisma.facilityOwner.findUnique({
      where: { userId: session.user.id },
      include: {
        venues: {
          include: {
            courts: true,
          },
        },
      },
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Owner profile not found" },
        { status: 404 }
      );
    }

    // Convert price from Paisa to Rupees for each court before sending
    const venuesForFrontend = owner.venues.map(venue => ({
      ...venue,
      courts: venue.courts.map(court => ({
        ...court,
        pricePerHour: court.pricePerHour / 100,
      })),
    }));

    return NextResponse.json(venuesForFrontend);
  } catch (error) {
    console.error("Error fetching owner venues:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/owner/venues
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
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
            { message: `Invalid file type: ${imageFile.type}. Only JPEG, PNG, and WebP are allowed.` },
            { status: 400 }
          );
        }

        if (imageFile.size > maxSize) {
          return NextResponse.json(
            { message: `File too large. Maximum size is 10MB.` },
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
            { message: 'Failed to upload image. Please try again.' },
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

    const validatedData = venueSchema.safeParse(venueData);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      address,
      city,
      state,
      country,
      amenities,
      courts,
    } = validatedData.data;

    const owner = await prisma.facilityOwner.findUnique({
      where: { userId: session.user.id },
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Owner profile not found" },
        { status: 404 }
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const newVenue = await prisma.$transaction(async (tx) => {
      // Check for existing slug before creating
      const existingVenue = await tx.venue.findUnique({ where: { slug } });
      if (existingVenue) {
        throw new Error(
          "Venue with this name already exists. Please use a different name."
        );
      }

      const venue = await tx.venue.create({
        data: {
          ownerId: owner.id,
          name,
          slug,
          description,
          address,
          city,
          state,
          country,
          amenities,
          image: cloudinaryResult?.secure_url || null, // Store Cloudinary URL
          imagePublicId: cloudinaryResult?.public_id || null, // Store for deletion later
          approved: false,
          courts: {
            create: courts.map((court) => ({
              ...court,
              pricePerHour: Math.round(court.pricePerHour * 100),
            })),
          },
        },
      });
      return venue;
    }, {
      timeout: 30000, // 30 seconds timeout for image processing
    });

    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    console.error("Error creating venue:", error);
    // Handle specific Prisma unique constraint error
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A venue with this slug already exists." },
        { status: 409 }
      );
    }
    // Handle custom error message from transaction
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
