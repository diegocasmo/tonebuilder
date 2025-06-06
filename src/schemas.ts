import { z } from 'zod';
import {
  EffectCategory,
  EffectSubcategory,
  EffectParameterType,
  EffectParameterUnit,
} from '@prisma/client';

export const EffectCategoryEnum = z.nativeEnum(EffectCategory);
export const EffectSubcategoryEnum = z.nativeEnum(EffectSubcategory);
export const EffectParameterTypeEnum = z.nativeEnum(EffectParameterType);
export const EffectParameterUnitEnum = z.nativeEnum(EffectParameterUnit);

const continuousParam = z.object({
  name: z.string().min(1).max(255),
  type: z.literal(EffectParameterType.CONTINUOUS),
  minValue: z.number(),
  maxValue: z.number(),
  stepValue: z.number(),
  defaultValue: z.number(),
  unit: EffectParameterUnitEnum.optional().nullable().default(null),
});

const discreteParam = z.object({
  name: z.string().min(1).max(255),
  type: z.literal(EffectParameterType.DISCRETE),
  options: z.array(z.string().min(1)),
  defaultOption: z.string(),
  unit: EffectParameterUnitEnum.optional().nullable().default(null),
});

const effectParameterSchema = z.discriminatedUnion('type', [
  continuousParam,
  discreteParam,
]);

export const effectSchema = z.object({
  name: z.string().min(1).max(255),
  category: EffectCategoryEnum,
  subcategory: EffectSubcategoryEnum,
  description: z.string().min(1).max(1000),
  parameters: z.array(effectParameterSchema).min(1),
});

export type EffectFile = z.infer<typeof effectSchema>;
