-- AlterTable
ALTER TABLE "Category" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Category" ADD COLUMN "seoKeywords" TEXT;
ALTER TABLE "Category" ADD COLUMN "seoTitle" TEXT;

-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL DEFAULT '車冷博士',
    "companyNameEn" TEXT NOT NULL DEFAULT 'Dr. Car Cold',
    "phone" TEXT NOT NULL DEFAULT '04-26301915',
    "fax" TEXT,
    "email" TEXT NOT NULL DEFAULT 'hongshun.TW@gmail.com',
    "address" TEXT NOT NULL DEFAULT '台中市龍井區臨港東路二段100號',
    "addressEn" TEXT,
    "businessHours" TEXT NOT NULL DEFAULT '週一至週五 8:30-17:30',
    "businessHoursEn" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" TEXT NOT NULL DEFAULT 'homepage',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "eventEn" TEXT NOT NULL,
    "description" TEXT,
    "descriptionEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SeoContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "page" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "keywordsEn" TEXT NOT NULL,
    "content" TEXT,
    "contentEn" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "structuredData" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Feature_position_idx" ON "Feature"("position");

-- CreateIndex
CREATE INDEX "Feature_order_idx" ON "Feature"("order");

-- CreateIndex
CREATE INDEX "Milestone_year_idx" ON "Milestone"("year");

-- CreateIndex
CREATE INDEX "Milestone_order_idx" ON "Milestone"("order");

-- CreateIndex
CREATE UNIQUE INDEX "SeoContent_page_key" ON "SeoContent"("page");

-- CreateIndex
CREATE INDEX "SeoContent_page_idx" ON "SeoContent"("page");
