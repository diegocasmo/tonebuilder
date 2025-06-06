import { PrismaClient, EffectParameterType } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { effectSchema, EffectFile } from '../src/schemas';

const prisma = new PrismaClient();

/**
 * Recursively collects all `.json` file paths under the given directory.
 */
function collectJsonFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(fullPath, out);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      out.push(fullPath);
    }
  }
  return out;
}

/**
 * Upserts a single effect (create if not exists; update description if it does).
 */
async function upsertEffect(
  name: string,
  category: EffectFile['category'],
  subcategory: EffectFile['subcategory'],
  description: string
) {
  return prisma.effect.upsert({
    where: {
      name_category_subcategory: { name, category, subcategory },
    },
    create: { name, category, subcategory, description },
    update: { description },
  });
}

/**
 * Upserts one effect parameter for a given effect ID.
 */
async function upsertEffectParameter(
  effectId: string,
  paramDef: NonNullable<EffectFile['parameters']>[number]
) {
  const baseData = {
    name: paramDef.name,
    type: paramDef.type as EffectParameterType,
    unit: paramDef.unit ?? null,
  };

  if (paramDef.type === EffectParameterType.CONTINUOUS) {
    const continuousData = {
      minValue: paramDef.minValue,
      maxValue: paramDef.maxValue,
      stepValue: paramDef.stepValue,
      defaultValue: paramDef.defaultValue,
    };
    return prisma.effectParameter.upsert({
      where: {
        effectId_name: { effectId, name: paramDef.name },
      },
      create: {
        effectId,
        ...baseData,
        ...continuousData,
      },
      update: {
        ...baseData,
        ...continuousData,
      },
    });
  } else {
    // DISCRETE
    const discreteData = {
      options: paramDef.options,
      defaultOption: paramDef.defaultOption,
    };
    return prisma.effectParameter.upsert({
      where: {
        effectId_name: { effectId, name: paramDef.name },
      },
      create: {
        effectId,
        ...baseData,
        ...discreteData,
      },
      update: {
        ...baseData,
        ...discreteData,
      },
    });
  }
}

type PendingEffect = {
  filePath: string;
  effectDef: EffectFile;
};

/**
 * Main entry point:
 *   1) Validate every JSON file against the Zod schema.
 *   2) If all pass, upsert all effects and their parameters.
 *   If any validation fails, print errors and exit without touching the DB.
 */
async function main() {
  const baseDir = path.join(process.cwd(), 'prisma', 'data', 'effects');
  const jsonPaths = collectJsonFiles(baseDir);

  const pendingEffects: PendingEffect[] = [];
  const validationErrors: Array<{ filePath: string; error: unknown }> = [];

  // PHASE 1: Validate all JSON files
  for (const filePath of jsonPaths) {
    let rawJson: unknown;
    try {
      rawJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      validationErrors.push({ filePath, error: e });
      continue;
    }

    try {
      const effectDef = effectSchema.parse(rawJson);
      pendingEffects.push({ filePath, effectDef });
    } catch (zErr) {
      validationErrors.push({ filePath, error: zErr });
    }
  }

  if (validationErrors.length > 0) {
    console.error('❌ Validation failed for one or more effect files:');
    for (const { filePath, error } of validationErrors) {
      console.error(`\nFile: ${filePath}\nError:`, error);
    }
    await prisma.$disconnect();
    process.exit(1);
  }

  // PHASE 2: All data valid → upsert into DB
  for (const { filePath, effectDef } of pendingEffects) {
    try {
      const record = await upsertEffect(
        effectDef.name,
        effectDef.category,
        effectDef.subcategory,
        effectDef.description
      );

      for (const paramDef of effectDef.parameters) {
        await upsertEffectParameter(record.id, paramDef);
      }

      console.log(
        `✅ Synchronized effect: ${effectDef.name} (${effectDef.category}/${effectDef.subcategory})`
      );
    } catch (dbErr) {
      console.error(`❌ Database error processing ${filePath}:`, dbErr);
    }
  }

  console.log('🎉 All JSON effect files have been processed.');
}

main()
  .catch((err) => {
    console.error('Unexpected error in sync-effects:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
