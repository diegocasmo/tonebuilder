import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';

export default async function RootPage() {
  const session = await auth();

  return <SessionProvider session={session}>more tests</SessionProvider>;
}
