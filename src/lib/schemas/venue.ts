// /src/lib/schemas/venue.ts
import { z } from "zod";

export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().default("India"),
  latitude: z.number().optional(), // Added here
  longitude: z.number().optional(), // Added here
  amenities: z.array(z.string()).default([]),
  courts: z
    .array(
      z.object({
        name: z.string().min(1, "Court name is required"),
        sport: z.string().min(1, "Sport type is required"),
        pricePerHour: z.number().min(1, "Price per hour is required"),
        currency: z.string().default("INR"),
        openTime: z.number().min(0).max(23),
        closeTime: z.number().min(1).max(24),
      })
    )
    .min(1, "At least one court is required"),
});

export type VenueFormData = z.infer<typeof venueSchema>;
