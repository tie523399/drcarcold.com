-- CreateTable
CREATE TABLE "NewsSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rssUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxArticlesPerCrawl" INTEGER NOT NULL DEFAULT 5,
    "crawlInterval" INTEGER NOT NULL DEFAULT 60,
    "lastCrawl" DATETIME,
    "selectors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "NewsSource_enabled_idx" ON "NewsSource"("enabled");
