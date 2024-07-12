-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "metadata_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Pricing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "currency_type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "Pricing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "token_id" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "StockItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "token_id" TEXT NOT NULL,
    "recipient_address" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    CONSTRAINT "Reservation_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Confirmation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "token_id_hash" TEXT NOT NULL,
    "recipient_address" TEXT NOT NULL,
    "contract_address" TEXT NOT NULL,
    "total_amount" REAL NOT NULL,
    "deadline" BIGINT NOT NULL,
    "created_at" BIGINT NOT NULL,
    "currency" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "token_id" TEXT NOT NULL,
    CONSTRAINT "Confirmation_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
