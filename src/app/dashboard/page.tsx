import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/sign-in');
  }

  // To-do: add <Suspense/>
  return <span>Welcome, {session.user.email}</span>;
}
