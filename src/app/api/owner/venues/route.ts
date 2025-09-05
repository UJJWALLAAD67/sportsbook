// /src/app/api/owner/venues/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import slugify from "slugify";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { venueSchema } from "@/lib/schemas/venue"; 
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

    return NextResponse.json(owner.venues);
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
    const body = await request.json();
    const validatedData = venueSchema.safeParse(body);

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
          approved: false,
          courts: {
            create: courts.map((court) => ({
              ...court,
            })),
          },
        },
      });
      return venue;
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
