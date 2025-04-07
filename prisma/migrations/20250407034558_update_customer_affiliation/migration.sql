/*
  Warnings:

  - You are about to drop the column `customerNumber` on the `customer_affiliations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customer_affiliations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "link" TEXT,
    "submitUser" TEXT
);
INSERT INTO "new_customer_affiliations" ("avatar", "id", "link", "name", "submitUser") SELECT "avatar", "id", "link", "name", "submitUser" FROM "customer_affiliations";
DROP TABLE "customer_affiliations";
ALTER TABLE "new_customer_affiliations" RENAME TO "customer_affiliations";
CREATE UNIQUE INDEX "customer_affiliations_name_key" ON "customer_affiliations"("name");
CREATE UNIQUE INDEX "customer_affiliations_link_key" ON "customer_affiliations"("link");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
