-- CreateEnum
CREATE TYPE "EffectCategory" AS ENUM ('DISTORTION', 'DYNAMICS', 'EQ', 'MODULATION', 'DELAY', 'REVERB', 'PITCH_SYNTH', 'FILTER', 'WAH', 'AMP_WITH_CAB');

-- CreateEnum
CREATE TYPE "EffectSubcategory" AS ENUM ('MONO', 'STEREO', 'LEGACY', 'GUITAR', 'BASS');

-- CreateEnum
CREATE TYPE "EffectParameterType" AS ENUM ('CONTINUOUS', 'DISCRETE');

-- CreateTable
CREATE TABLE "effects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EffectCategory" NOT NULL,
    "subcategory" "EffectSubcategory" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "effect_parameters" (
    "id" TEXT NOT NULL,
    "effect_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EffectParameterType" NOT NULL,
    "min_value" DOUBLE PRECISION,
    "max_value" DOUBLE PRECISION,
    "step_value" DOUBLE PRECISION,
    "default_value" DOUBLE PRECISION,
    "options" TEXT[],
    "default_option" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "effect_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "effects_category_subcategory_idx" ON "effects"("category", "subcategory");

-- CreateIndex
CREATE UNIQUE INDEX "effects_name_category_subcategory_key" ON "effects"("name", "category", "subcategory");

-- CreateIndex
CREATE UNIQUE INDEX "effect_parameters_effect_id_name_key" ON "effect_parameters"("effect_id", "name");

-- AddForeignKey
ALTER TABLE "effect_parameters" ADD CONSTRAINT "effect_parameters_effect_id_fkey" FOREIGN KEY ("effect_id") REFERENCES "effects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
