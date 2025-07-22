-- AlterTable
ALTER TABLE "News" ADD COLUMN "contentHash" TEXT;
ALTER TABLE "News" ADD COLUMN "sourceId" TEXT;

-- CreateIndex
CREATE INDEX "News_sourceId_idx" ON "News"("sourceId");

-- CreateIndex
CREATE INDEX "News_contentHash_idx" ON "News"("contentHash");
