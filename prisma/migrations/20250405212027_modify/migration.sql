/*
  Warnings:

  - You are about to alter the column `submitTime` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `transactionTime` on the `transaction_details` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `createdAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `lastLogin` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "affiliation" TEXT,
    "customerStatus" TEXT,
    "transactionStatus" TEXT,
    "notes" TEXT,
    "submitTime" BIGINT NOT NULL,
    "submitUser" TEXT
);
INSERT INTO "new_customers" ("affiliation", "customerName", "customerStatus", "id", "notes", "phoneNumber", "submitTime", "submitUser", "transactionStatus") SELECT "affiliation", "customerName", "customerStatus", "id", "notes", "phoneNumber", "submitTime", "submitUser", "transactionStatus" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE UNIQUE INDEX "customers_phoneNumber_key" ON "customers"("phoneNumber");
CREATE INDEX "customers_phoneNumber_idx" ON "customers"("phoneNumber");
CREATE INDEX "customers_submitTime_idx" ON "customers"("submitTime");
CREATE INDEX "customers_submitUser_idx" ON "customers"("submitUser");
CREATE INDEX "customers_transactionStatus_idx" ON "customers"("transactionStatus");
CREATE UNIQUE INDEX "customers_customerName_phoneNumber_key" ON "customers"("customerName", "phoneNumber");
CREATE TABLE "new_transaction_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "transactionTime" BIGINT NOT NULL,
    CONSTRAINT "transaction_details_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_transaction_details" ("customerId", "id", "productName", "quantity", "totalAmount", "transactionTime", "unitPrice") SELECT "customerId", "id", "productName", "quantity", "totalAmount", "transactionTime", "unitPrice" FROM "transaction_details";
DROP TABLE "transaction_details";
ALTER TABLE "new_transaction_details" RENAME TO "transaction_details";
CREATE INDEX "transaction_details_customerId_idx" ON "transaction_details"("customerId");
CREATE INDEX "transaction_details_transactionTime_idx" ON "transaction_details"("transactionTime");
CREATE INDEX "transaction_details_productName_idx" ON "transaction_details"("productName");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    "lastLogin" BIGINT
);
INSERT INTO "new_users" ("createdAt", "email", "id", "lastLogin", "password", "role", "username") SELECT "createdAt", "email", "id", "lastLogin", "password", "role", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE INDEX "users_role_idx" ON "users"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
