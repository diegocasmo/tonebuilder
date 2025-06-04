import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Alert, AlertDescription } from '@/components/ui/alert';

type RootFormErrorProps = {
  message?: string;
};

export function RootFormError({ message }: RootFormErrorProps) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <ExclamationCircleIcon className="h-4 w-4 !translate-y-0 self-center" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
