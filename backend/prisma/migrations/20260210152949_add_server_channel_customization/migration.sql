-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "topic" VARCHAR(1024);

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "description" VARCHAR(500);
