-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "affiliation" TEXT,
    "customerStatus" TEXT,
    "transactionStatus" TEXT,
    "notes" TEXT,
    "submitTime" INTEGER NOT NULL,
    "submitUser" TEXT
);

-- CreateTable
CREATE TABLE "transaction_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "transactionTime" INTEGER NOT NULL,
    CONSTRAINT "transaction_details_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "lastLogin" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phoneNumber_key" ON "customers"("phoneNumber");

-- CreateIndex
CREATE INDEX "customers_phoneNumber_idx" ON "customers"("phoneNumber");

-- CreateIndex
CREATE INDEX "customers_submitTime_idx" ON "customers"("submitTime");

-- CreateIndex
CREATE INDEX "customers_submitUser_idx" ON "customers"("submitUser");

-- CreateIndex
CREATE INDEX "customers_transactionStatus_idx" ON "customers"("transactionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerName_phoneNumber_key" ON "customers"("customerName", "phoneNumber");

-- CreateIndex
CREATE INDEX "transaction_details_customerId_idx" ON "transaction_details"("customerId");

-- CreateIndex
CREATE INDEX "transaction_details_transactionTime_idx" ON "transaction_details"("transactionTime");

-- CreateIndex
CREATE INDEX "transaction_details_productName_idx" ON "transaction_details"("productName");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");
