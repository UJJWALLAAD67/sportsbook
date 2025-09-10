import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma";

const relevantEvents = new Set([
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "charge.refunded",
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ message: "No stripe-signature header" }, { status: 400 });
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET! // Use the environment variable
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntentSucceeded = event.data.object;
          await prisma.payment.update({
            where: { stripePaymentIntentId: paymentIntentSucceeded.id },
            data: { status: "SUCCEEDED", receiptUrl: paymentIntentSucceeded.charges.data[0].receipt_url },
          });
          await prisma.booking.update({
            where: { paymentId: paymentIntentSucceeded.id }, // Assuming paymentId in booking is paymentIntentId
            data: { status: BookingStatus.CONFIRMED },
          });
          break;
        case "payment_intent.payment_failed":
        case "payment_intent.canceled":
          const paymentIntentFailed = event.data.object;
          await prisma.payment.update({
            where: { stripePaymentIntentId: paymentIntentFailed.id },
            data: { status: "FAILED" },
          });
          await prisma.booking.update({
            where: { paymentId: paymentIntentFailed.id }, // Assuming paymentId in booking is paymentIntentId
            data: { status: BookingStatus.CANCELLED },
          });
          break;
        case "charge.refunded":
          const chargeRefunded = event.data.object;
          await prisma.payment.update({
            where: { stripePaymentIntentId: chargeRefunded.payment_intent },
            data: { status: "REFUNDED" },
          });
          // Optionally update booking status if a full refund means cancellation
          break;
        default:
          console.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error("Error handling Stripe webhook event:", error);
      return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
