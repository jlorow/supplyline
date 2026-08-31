'use client';

import { useStore } from '@/lib/store';

export default function CallTranscript() {
  const { state } = useStore();

  const activeLoad = state.loads.find((l) => l.id === state.activeLoadId);
  const loadQuotes = activeLoad
    ? state.quotes.filter((q) => q.loadId === activeLoad.id).sort((a, b) => a.round - b.round)
    : [];

  if (loadQuotes.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-md font-semibold text-gray-800">Call Transcripts</h3>
      <div className="space-y-4">
        {loadQuotes.map((quote) => {
          const carrier = state.carriers.find((c) => c.id === quote.carrierId);
          return (
            <div
              key={quote.id}
              className="rounded-md border border-gray-100 bg-gray-50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{carrier?.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      quote.round === 1
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    Round {quote.round}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(quote.timestamp).toLocaleTimeString()}
                </p>
              </div>

              <div className="mb-2 rounded-md bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Transcript
                </p>
                <p className="mt-1 text-sm text-gray-700 italic">
                  &ldquo;{quote.transcript || 'No transcript available.'}&rdquo;
                </p>
              </div>

              {quote.evidence && (
                <div className="rounded-md bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Evidence
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {quote.evidence}
                  </p>
                </div>
              )}

              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>Available: <span className="font-medium text-gray-700">{quote.available}</span></span>
                <span>Pickup: <span className="font-medium text-gray-700">{quote.pickupConfirmed}</span></span>
                {quote.quotedRate && (
                  <span>Rate: <span className="font-medium text-gray-700">${quote.quotedRate.toLocaleString()}</span></span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
