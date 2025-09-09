/*
  Warnings:

  - The `metadata` column on the `EmailOtp` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `photos` on the `Venue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Court" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."EmailOtp" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "public"."Venue" DROP COLUMN "photos",
ADD COLUMN     "imageUrl" TEXT;
