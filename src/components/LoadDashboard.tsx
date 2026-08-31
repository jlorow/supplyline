import { Load } from '@/lib/types';
import LoadCard from './LoadCard';

interface LoadDashboardProps {
  loads: Load[];
  isSourcing: boolean;
  onSource: (loadId: string) => void;
}

export default function LoadDashboard({ loads, isSourcing, onSource }: LoadDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            SupplyLine — Freight Sourcing Agent
          </h1>
          <h2 className="text-xl text-gray-600 mt-1">Load Board</h2>
        </header>
        <main>
          {loads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No loads available</p>
            </div>
          ) : (
            loads.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                isSourcing={isSourcing}
                onSource={onSource}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
