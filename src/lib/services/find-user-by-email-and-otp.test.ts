import { findUserByEmailAndOtp } from './find-user-by-email-and-otp';
import {
  createTestUser,
  createTestVerificationToken,
} from '@/test/test-helpers';
import { prisma } from '@/lib/prisma/index';

describe('findUserByEmailAndOtp', () => {
  const testEmail = 'test@example.com';
  const testOtp = 'ABC123';

  describe('when verification token exists and is valid', () => {
    describe('and user does not exist', () => {
      it('should create a new user and return it', async () => {
        // Create a valid verification token
        await createTestVerificationToken({
          identifier: testEmail,
          token: testOtp,
          expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        });

        const result = await findUserByEmailAndOtp(testEmail, testOtp);

        expect(result).toBeDefined();
        expect(result?.email).toBe(testEmail);

        // Verify user was created in database
        const createdUser = await prisma.user.findUnique({
          where: { email: testEmail },
        });
        expect(createdUser).toBeDefined();
        expect(createdUser?.id).toBe(result?.id);

        // Verify verification token was deleted
        const token = await prisma.verificationToken.findFirst({
          where: { identifier: testEmail, token: testOtp },
        });
        expect(token).toBeNull();
      });
    });

    describe('and user already exists', () => {
      it('should return the existing user', async () => {
        // Create existing user
        const existingUser = await createTestUser({ email: testEmail });

        // Create a valid verification token
        await createTestVerificationToken({
          identifier: testEmail,
          token: testOtp,
          expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        });

        const result = await findUserByEmailAndOtp(testEmail, testOtp);

        expect(result).toBeDefined();
        expect(result?.id).toBe(existingUser.id);
        expect(result?.email).toBe(testEmail);

        // Verify no additional user was created
        const userCount = await prisma.user.count({
          where: { email: testEmail },
        });
        expect(userCount).toBe(1);

        // Verify verification token was deleted
        const token = await prisma.verificationToken.findFirst({
          where: { identifier: testEmail, token: testOtp },
        });
        expect(token).toBeNull();
      });
    });
  });

  describe('when verification token does not exist', () => {
    it('should return null', async () => {
      const result = await findUserByEmailAndOtp(testEmail, 'INVALID_OTP');

      expect(result).toBeNull();
    });
  });

  describe('when verification token is expired', () => {
    it('should return null', async () => {
      // Create an expired verification token
      await createTestVerificationToken({
        identifier: testEmail,
        token: testOtp,
        expires: new Date(Date.now() - 60 * 1000), // 1 minute ago (expired)
      });

      const result = await findUserByEmailAndOtp(testEmail, testOtp);

      expect(result).toBeNull();

      // Verify expired token still exists (wasn't deleted)
      const token = await prisma.verificationToken.findFirst({
        where: { identifier: testEmail, token: testOtp },
      });
      expect(token).toBeDefined();
    });
  });

  describe('when verification token exists but for different email', () => {
    it('should return null', async () => {
      const differentEmail = 'different@example.com';

      // Create verification token for different email
      await createTestVerificationToken({
        identifier: differentEmail,
        token: testOtp,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      });

      const result = await findUserByEmailAndOtp(testEmail, testOtp);

      expect(result).toBeNull();

      // Verify token for different email still exists
      const token = await prisma.verificationToken.findFirst({
        where: { identifier: differentEmail, token: testOtp },
      });
      expect(token).toBeDefined();
    });
  });

  describe('when verification token exists but with different OTP', () => {
    it('should return null', async () => {
      const differentOtp = 'XYZ789';

      // Create verification token with different OTP
      await createTestVerificationToken({
        identifier: testEmail,
        token: differentOtp,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      });

      const result = await findUserByEmailAndOtp(testEmail, testOtp);

      expect(result).toBeNull();

      // Verify token with different OTP still exists
      const token = await prisma.verificationToken.findFirst({
        where: { identifier: testEmail, token: differentOtp },
      });
      expect(token).toBeDefined();
    });
  });
});
