-- CreateTable
CREATE TABLE "UploadLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadStarted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadFinished" TIMESTAMP(3),

    CONSTRAINT "UploadLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UploadLog" ADD CONSTRAINT "UploadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
