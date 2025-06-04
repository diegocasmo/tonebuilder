import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/sign-in');
  }

  return <span>Welcome, {session.user.email}</span>;
}
