'use client';

import { useAppContext } from '@/lib/store';
import LoadDashboard from '@/components/LoadDashboard';

export default function Home() {
  const { state } = useAppContext();

  const handleSource = (loadId: string) => {
    console.log('Source carriers for load:', loadId);
  };

  return (
    <LoadDashboard
      loads={state.loads}
      isSourcing={state.isSourcing}
      onSource={handleSource}
    />
  );
}
