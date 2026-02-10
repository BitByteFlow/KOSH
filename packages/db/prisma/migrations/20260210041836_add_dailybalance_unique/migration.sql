/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `DailyBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DailyBalance_date_key";

-- DropIndex
DROP INDEX "DailyBalance_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "DailyBalance_userId_date_key" ON "DailyBalance"("userId", "date");
