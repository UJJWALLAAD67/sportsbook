-- Migration to remove imageUrl columns from Venue and Court tables
-- This is part of removing the redundant image URL functionality

-- Remove imageUrl column from Venue table
ALTER TABLE "Venue" DROP COLUMN IF EXISTS "imageUrl";

-- Remove imageUrl column from Court table  
ALTER TABLE "Court" DROP COLUMN IF EXISTS "imageUrl";
