'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    router.replace('/studio');
  }, [router]);
  return <>{children}</>;
}
