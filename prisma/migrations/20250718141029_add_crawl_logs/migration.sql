-- CreateTable
CREATE TABLE "CrawlLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "articlesFound" INTEGER NOT NULL,
    "articlesProcessed" INTEGER NOT NULL,
    "articlesPublished" INTEGER NOT NULL,
    "articlesFailed" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "success" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CrawlLog_sourceId_idx" ON "CrawlLog"("sourceId");

-- CreateIndex
CREATE INDEX "CrawlLog_createdAt_idx" ON "CrawlLog"("createdAt");

-- CreateIndex
CREATE INDEX "CrawlLog_success_idx" ON "CrawlLog"("success");
