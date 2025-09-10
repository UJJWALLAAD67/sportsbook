import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        court: {
          select: {
            pricePerHour: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.payment?.status === "SUCCEEDED") {
      return NextResponse.json(
        { error: "Payment already succeeded for this booking" },
        { status: 400 }
      );
    }

    // Calculate amount in smallest currency unit (e.g., cents for USD, paisa for INR)
    // Assuming pricePerHour is already in paisa/cents from court model
    const durationInMilliseconds = booking.endTime.getTime() - booking.startTime.getTime();
    const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
    const amount = booking.court.pricePerHour * durationInHours;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr", // Assuming INR, adjust as needed
      metadata: { bookingId: booking.id.toString() },
    });

    // Update the payment record with the PaymentIntent ID
    if (booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          amount: amount, // Ensure amount is consistent
          status: "PENDING", // Keep as PENDING until webhook confirms
        },
      });
    } else {
      // This case should ideally not happen if booking creation always creates a payment record
      console.warn("Booking found without an associated payment record.");
      // Optionally create a new payment record here if robust error handling is needed
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
