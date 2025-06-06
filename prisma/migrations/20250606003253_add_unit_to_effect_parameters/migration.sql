-- CreateEnum
CREATE TYPE "EffectParameterUnit" AS ENUM ('DECIBEL', 'MILLISECOND', 'PERCENTAGE');

-- AlterTable
ALTER TABLE "effect_parameters" ADD COLUMN     "unit" "EffectParameterUnit";
