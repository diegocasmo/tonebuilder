'use server';

import { requestOtp } from '@/lib/services/request-otp';
import { signInSchema } from '@/app/auth/sign-in/schemas/sign-in-schema';
import { parseZodErrors, createZodError } from '@/lib/utils/form';
import { transformPrismaErrorToZodError } from '@/lib/prisma/error-handler';
import type { ActionResult } from '@/types';

export const requestOtpAction = async (
  formData: FormData
): Promise<ActionResult> => {
  const result = signInSchema.safeParse({ email: formData.get('email') });

  if (!result.success) {
    return { success: false, errors: parseZodErrors(result) };
  }

  try {
    await requestOtp(result.data.email);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to send OTP:', error);

    const zodError =
      transformPrismaErrorToZodError(error) ||
      createZodError(
        'Something went wrong while sending the OTP. Please try again.',
        ['root']
      );
    return {
      success: false,
      errors: parseZodErrors(zodError),
    };
  }
};
