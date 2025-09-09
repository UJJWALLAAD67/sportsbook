// src/lib/schemas/venue.ts
import { z } from "zod";

// Court schema
const courtSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Court name is required"),
  sport: z.string().min(1, "Sport type is required"),
  pricePerHour: z.coerce.number().min(0, "Price must be a non-negative number"),
  currency: z.string().min(1, "Currency is required"),
  openTime: z.coerce
    .number()
    .min(0)
    .max(23, "Opening time must be between 0 and 23"),
  closeTime: z.coerce
    .number()
    .min(1)
    .max(24, "Closing time must be between 1 and 24"),
});

// Venue schema
export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  amenities: z.array(z.string()),
  courts: z.array(courtSchema).min(1, "At least one court is required"),
});

// Type inference for form data
export type VenueFormData = z.infer<typeof venueSchema>;
