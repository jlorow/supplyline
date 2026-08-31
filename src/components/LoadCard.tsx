'use client';

import { Load } from '@/lib/types';
import { useStore } from '@/lib/store';
import { callCarriersForQuotes } from '@/app/actions';
import StatusBadge from './StatusBadge';

interface LoadCardProps {
  load: Load;
}

export default function LoadCard({ load }: LoadCardProps) {
  const { state, startSourcing, addQuotes, setError } = useStore();

  const handleSourceCarriers = async () => {
    startSourcing();

    try {
      const activeLoad = state.loads.find((l) => l.id === state.activeLoadId);
      if (!activeLoad) {
        throw new Error('No active load found');
      }

      const quotes = await callCarriersForQuotes(activeLoad.id);
      addQuotes(quotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to source carriers');
    }
  };

  const isSourcing = state.isSourcing && state.activeLoadId === load.id;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {load.origin} → {load.destination}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {load.equipmentType} • {load.weight.toLocaleString()} lbs • Pickup: {load.pickupDate}
          </p>
        </div>
        <StatusBadge status={load.status} />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleSourceCarriers}
          disabled={isSourcing || load.status !== 'uncovered'}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            isSourcing || load.status !== 'uncovered'
              ? 'cursor-not-allowed bg-gray-300 text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSourcing ? 'Sourcing...' : 'Source Carriers'}
        </button>

        {state.error && state.activeLoadId === load.id && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
      </div>
    </div>
  );
}
