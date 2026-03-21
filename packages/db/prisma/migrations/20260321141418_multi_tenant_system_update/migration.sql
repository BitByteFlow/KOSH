/*
  Warnings:

  - You are about to drop the column `userId` on the `AccountTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CreditAccount` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `DailyBalance` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,date]` on the table `DailyBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,sku]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,barcode]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `AccountTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `CreditAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `DailyBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Settings` table without a default value. This is not possible if the table is not empty.
  - Made the column `googleId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `image` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CASHIER', 'MANAGER');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'OPENING_STOCK');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM_ALERT';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'ADJUSTMENT';

-- DropForeignKey
ALTER TABLE "AccountTransaction" DROP CONSTRAINT "AccountTransaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "CreditAccount" DROP CONSTRAINT "CreditAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "DailyBalance" DROP CONSTRAINT "DailyBalance_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_userId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_userId_fkey";

-- DropForeignKey
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_userId_fkey";

-- DropIndex
DROP INDEX "AccountTransaction_userId_idx";

-- DropIndex
DROP INDEX "Category_userId_idx";

-- DropIndex
DROP INDEX "Category_userId_name_key";

-- DropIndex
DROP INDEX "CreditAccount_userId_idx";

-- DropIndex
DROP INDEX "DailyBalance_userId_date_idx";

-- DropIndex
DROP INDEX "DailyBalance_userId_date_key";

-- DropIndex
DROP INDEX "Product_userId_idx";

-- DropIndex
DROP INDEX "ProductVariant_barcode_key";

-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- DropIndex
DROP INDEX "Settings_userId_key";

-- AlterTable
ALTER TABLE "AccountTransaction" DROP COLUMN "userId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "userId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CreditAccount" DROP COLUMN "userId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DailyBalance" DROP COLUMN "userId",
ADD COLUMN     "storeId" TEXT NOT NULL,
ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "userId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "userId",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NRP',
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "contactNumber",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN',
ALTER COLUMN "googleId" SET NOT NULL,
ALTER COLUMN "image" SET NOT NULL;

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreMember" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CASHIER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StoreMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreMember_storeId_userId_key" ON "StoreMember"("storeId", "userId");

-- CreateIndex
CREATE INDEX "AccountTransaction_storeId_createdAt_idx" ON "AccountTransaction"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "AccountTransaction_dailyBalanceId_idx" ON "AccountTransaction"("dailyBalanceId");

-- CreateIndex
CREATE INDEX "Category_storeId_idx" ON "Category"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_storeId_name_key" ON "Category"("storeId", "name");

-- CreateIndex
CREATE INDEX "CreditAccount_storeId_idx" ON "CreditAccount"("storeId");

-- CreateIndex
CREATE INDEX "DailyBalance_storeId_date_idx" ON "DailyBalance"("storeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyBalance_storeId_date_key" ON "DailyBalance"("storeId", "date");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_storeId_name_key" ON "Product"("storeId", "name");

-- CreateIndex
CREATE INDEX "ProductVariant_storeId_idx" ON "ProductVariant"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_storeId_sku_key" ON "ProductVariant"("storeId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_storeId_barcode_key" ON "ProductVariant"("storeId", "barcode");

-- CreateIndex
CREATE INDEX "Purchase_storeId_createdAt_idx" ON "Purchase"("storeId", "createdAt");

-- CreateIndex
CREATE INDEX "Sale_storeId_createdAt_idx" ON "Sale"("storeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_storeId_key" ON "Settings"("storeId");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTransaction" ADD CONSTRAINT "AccountTransaction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyBalance" ADD CONSTRAINT "DailyBalance_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
