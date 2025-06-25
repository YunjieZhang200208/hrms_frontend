'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login'); // Replace '/' with '/login'
  }, [router]);

  return null; // Optionally show a loading spinner here
}
