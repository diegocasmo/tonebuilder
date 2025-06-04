import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export async function findUserByEmailAndOtp(
  email: string,
  otp: string
): Promise<User | null> {
  try {
    return prisma.$transaction(async (tx) => {
      await prisma.verificationToken.delete({
        where: {
          identifier: email,
          token: otp,
          expires: { gt: new Date() },
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
