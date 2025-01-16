/*
  Warnings:

  - You are about to drop the column `s3Bucket` on the `UploadLog` table. All the data in the column will be lost.
  - You are about to drop the column `s3Key` on the `UploadLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UploadLog" DROP COLUMN "s3Bucket",
DROP COLUMN "s3Key",
ADD COLUMN     "bucketS3" TEXT,
ADD COLUMN     "keyS3" TEXT;
