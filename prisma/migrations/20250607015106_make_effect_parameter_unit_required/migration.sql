/*
  Warnings:

  - Made the column `unit` on table `effect_parameters` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "effect_parameters" ALTER COLUMN "unit" SET NOT NULL;
