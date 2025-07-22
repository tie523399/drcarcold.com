-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "thumbnail" TEXT,
    "link" TEXT,
    "position" TEXT NOT NULL DEFAULT 'homepage',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Banner" ("createdAt", "description", "id", "image", "isActive", "link", "order", "position", "thumbnail", "title", "updatedAt") SELECT "createdAt", "description", "id", "image", "isActive", "link", "order", "position", "thumbnail", "title", "updatedAt" FROM "Banner";
DROP TABLE "Banner";
ALTER TABLE "new_Banner" RENAME TO "Banner";
CREATE INDEX "Banner_position_idx" ON "Banner"("position");
CREATE INDEX "Banner_order_idx" ON "Banner"("order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
