import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export async function findUserByEmailAndOtp(
  email: string,
  otp: string
): Promise<User | null> {
  try {
    return prisma.$transaction(async (tx) => {
      // First check if the verification token exists and is valid
      const verificationToken = await tx.verificationToken.findFirst({
        where: {
          identifier: email,
          token: otp,
          expires: { gt: new Date() },
        },
      });

      // If no valid token found, return null
      if (!verificationToken) {
        return null;
      }

      // Delete the verification token
      await tx.verificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });

      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await tx.user.create({
          data: { email },
        });
      }

      return user;
    });
  } catch (error) {
    console.error('Error finding user by email and OTP:', error);
    throw error;
  }
}
