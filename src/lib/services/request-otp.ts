import { prisma } from '@/lib/prisma';
import { getResend } from '@/lib/auth/resend';
import { MS_PER_MIN } from '@/lib/utils/time';

export async function requestOtp(email: string) {
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl) {
    throw new Error('NEXTAUTH_URL is not set in the environment variables');
  }

  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    throw new Error('EMAIL_FROM is not set in the environment variables');
  }

  const otp = Buffer.from(crypto.getRandomValues(new Uint8Array(8)))
    .toString('hex')
    .slice(0, 6);
  const expires = new Date(Date.now() + 10 * MS_PER_MIN); // 10 minutes from now
  const { host } = new URL(nextAuthUrl);

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await tx.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    });
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP for ${email}: ${otp}`);
  } else {
    const resend = getResend();
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `Your One-Time Password for ${host}`,
      html: `Your one-time password is: <strong>${otp}</strong>. It will expire in 10 minutes.`,
    });
  }
}
