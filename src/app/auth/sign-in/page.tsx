import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { SignInForm } from '@/app/auth/sign-in/components/sign-in-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          <Link href="/">Tonebuilder.ai</Link>
        </CardTitle>
        <CardDescription className="text-center">
          AI-powered, chat-based tone architect that helps musicians create
          presets for any multi-effects processor Small wins. Big progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
}
