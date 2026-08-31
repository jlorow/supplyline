'use client';

import { useStore } from '@/lib/store';
import LoadCard from './LoadCard';

export default function LoadDashboard() {
  const { state } = useStore();
  const activeLoad = state.loads.find((l) => l.id === state.activeLoadId);

  const loadQuotes = activeLoad
    ? state.quotes.filter((q) => q.loadId === activeLoad.id && q.round === 1)
    : [];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SupplyLine</h1>
        <p className="text-sm text-gray-500">Freight Sourcing Agent</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Load Board</h2>
      </div>

      {activeLoad && <LoadCard load={activeLoad} />}

      {loadQuotes.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-md font-semibold text-gray-800">Round 1 Quotes</h3>
          <div className="space-y-3">
            {loadQuotes.map((quote) => {
              const carrier = state.carriers.find((c) => c.id === quote.carrierId);
              return (
                <div
                  key={quote.id}
                  className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{carrier?.name}</p>
                    <p className="text-sm text-gray-500">
                      Available: {quote.available} • Pickup: {quote.pickupConfirmed}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{quote.evidence}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {quote.quotedRate ? `$${quote.quotedRate.toLocaleString()}` : 'No quote'}
                    </p>
                    <p className="text-xs text-gray-400">{quote.round === 1 ? 'Round 1' : 'Round 2'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
