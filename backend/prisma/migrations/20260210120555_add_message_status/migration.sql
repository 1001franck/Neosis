-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deliveredAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserChannelRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "lastReadMessageId" TEXT,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChannelRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserChannelRead_channelId_userId_idx" ON "UserChannelRead"("channelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChannelRead_userId_channelId_key" ON "UserChannelRead"("userId", "channelId");

-- AddForeignKey
ALTER TABLE "UserChannelRead" ADD CONSTRAINT "UserChannelRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChannelRead" ADD CONSTRAINT "UserChannelRead_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
