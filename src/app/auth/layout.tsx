export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        {children}
      </main>
    </div>
  );
}
