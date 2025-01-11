/*
  Warnings:

  - You are about to drop the column `s3Url` on the `UploadLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UploadLog" DROP COLUMN "s3Url",
ADD COLUMN     "s3Bucket" TEXT,
ADD COLUMN     "s3Key" TEXT;
