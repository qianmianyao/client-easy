-- CreateTable
CREATE TABLE "customer_affiliations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "link" TEXT,
    "customerNumber" INTEGER,
    "submitUser" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_affiliations_name_key" ON "customer_affiliations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_affiliations_link_key" ON "customer_affiliations"("link");
