-- Migration to add image field to Venue table
-- This allows venues to have a single image stored

-- Add image column to Venue table
ALTER TABLE "Venue" ADD COLUMN "image" TEXT;
