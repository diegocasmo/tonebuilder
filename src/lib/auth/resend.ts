import { Resend } from 'resend';

export const getResend = () => {
  if (!process.env.AUTH_RESEND_KEY) {
    throw new Error('AUTH_RESEND_KEY environment variable is not set');
  }

  return new Resend(process.env.AUTH_RESEND_KEY);
};
