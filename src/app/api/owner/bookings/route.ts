import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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

    const bookings = await prisma.booking.findMany({
      where: {
        court: {
          venue: {
            ownerId: owner.id,
          },
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        court: {
          include: {
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
