import type React from 'react';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-6 mb-[82px]">
        <div className="container max-w-7xl mx-auto px-2">{children}</div>
      </main>
    </div>
  );
}
