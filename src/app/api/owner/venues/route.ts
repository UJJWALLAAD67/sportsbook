// /src/app/api/owner/venues/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import slugify from "slugify";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { venueSchema } from "@/lib/schemas/venue";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "@/lib/cloudinary";

// POST /api/owner/venues
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let cloudinaryResult: { public_id: string; secure_url: string } | null = null;

  try {
    const contentType = request.headers.get("content-type");
    let venueData: any;

    if (contentType?.includes("multipart/form-data")) {
      // Handle multipart form with image
      const formData = await request.formData();

      // Parse JSON venue data *before* uploading image
      const venueDataString = formData.get("venueData") as string;
      if (!venueDataString) {
        return NextResponse.json(
          { message: "Missing venueData" },
          { status: 400 }
        );
      }

      venueData = JSON.parse(venueDataString);

      // Validate venue data
      const validated = venueSchema.safeParse(venueData);
      if (!validated.success) {
        return NextResponse.json(
          {
            message: "Invalid data",
            errors: validated.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      venueData = validated.data;

      // Upload image if provided
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
            {
              message: `Invalid file type: ${imageFile.type}. Only JPEG, PNG, and WebP are allowed.`,
            },
            { status: 400 }
          );
        }
        if (imageFile.size > maxSize) {
          return NextResponse.json(
            { message: "File too large (max 10MB)" },
            { status: 400 }
          );
        }

        try {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          cloudinaryResult = await uploadImageToCloudinary(buffer, "venues");
        } catch (err) {
          console.error("Cloudinary upload failed:", err);
          return NextResponse.json(
            { message: "Failed to upload image" },
            { status: 500 }
          );
        }
      }
    } else {
      // Handle plain JSON requests
      const body = await request.json();
      const validated = venueSchema.safeParse(body);
      if (!validated.success) {
        return NextResponse.json(
          {
            message: "Invalid data",
            errors: validated.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      venueData = validated.data;
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
    } = venueData;

    // Ensure owner profile exists
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
      const existingVenue = await tx.venue.findUnique({ where: { slug } });
      if (existingVenue) {
        throw new Error(
          "Venue with this name already exists. Please choose a different name."
        );
      }

      return tx.venue.create({
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
          image: cloudinaryResult?.secure_url || null,
          imagePublicId: cloudinaryResult?.public_id || null,
          approved: false,
          courts: {
            create: courts.map((court: any) => ({
              ...court,
              pricePerHour: Math.round(court.pricePerHour * 100), // Rupees → Paisa
            })),
          },
        },
      });
    });

    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    console.error("Error creating venue:", error);

    // Rollback Cloudinary upload if DB insert fails
    if (cloudinaryResult?.public_id) {
      try {
        await deleteImageFromCloudinary(cloudinaryResult.public_id);
      } catch (cleanupError) {
        console.error("Failed to cleanup Cloudinary image:", cleanupError);
      }
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A venue with this slug already exists." },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// GET /api/owner/venues
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.facilityOwner.findUnique({
      where: { userId: session.user.id },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Owner profile not found" },
        { status: 404 }
      );
    }

    const venues = await prisma.venue.findMany({
      where: { ownerId: owner.id },
      include: { courts: true },
    });

    // Convert price from Paisa → Rupees for frontend
    const venuesForFrontend = venues.map((venue) => ({
      ...venue,
      courts: venue.courts.map((court) => ({
        ...court,
        pricePerHour: court.pricePerHour / 100,
      })),
    }));

    console.log("Venues for frontend (owner API):", venuesForFrontend); // Add this line

    return NextResponse.json(venuesForFrontend);
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}
