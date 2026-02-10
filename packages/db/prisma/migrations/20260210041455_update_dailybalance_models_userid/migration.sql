/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `DailyBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DailyBalance_userId_key" ON "DailyBalance"("userId");
