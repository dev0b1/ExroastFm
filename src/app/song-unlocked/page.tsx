import SongUnlockedClient from '@/components/SongUnlockedClient';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <SongUnlockedClient />
    </Suspense>
  );
}
