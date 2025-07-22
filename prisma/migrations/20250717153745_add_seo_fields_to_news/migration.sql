-- AlterTable
ALTER TABLE "News" ADD COLUMN "canonicalUrl" TEXT;
ALTER TABLE "News" ADD COLUMN "ogDescription" TEXT;
ALTER TABLE "News" ADD COLUMN "ogImage" TEXT;
ALTER TABLE "News" ADD COLUMN "ogTitle" TEXT;
ALTER TABLE "News" ADD COLUMN "readingTime" INTEGER;
ALTER TABLE "News" ADD COLUMN "relatedNews" TEXT;
ALTER TABLE "News" ADD COLUMN "seoKeywords" TEXT;
ALTER TABLE "News" ADD COLUMN "sourceName" TEXT;
ALTER TABLE "News" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "News" ADD COLUMN "structuredData" TEXT;

-- CreateIndex
CREATE INDEX "News_tags_idx" ON "News"("tags");

-- CreateIndex
CREATE INDEX "News_sourceName_idx" ON "News"("sourceName");
