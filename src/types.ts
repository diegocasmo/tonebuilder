import type { FieldErrors } from 'react-hook-form';

export type OtpCredentials = {
  email: string;
  otp: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors };
