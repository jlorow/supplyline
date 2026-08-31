'use client';

import { useStore } from '@/lib/store';
import { compareRound1Quotes, determineFinalWinner } from '@/lib/comparison';
import { negotiateWithCarrier, generateRecommendationSummary, createBooking } from '@/app/actions';
import LoadCard from './LoadCard';
import BookingConfirmation from './BookingConfirmation';
import CallTranscript from './CallTranscript';

export default function LoadDashboard() {
  const { state, startNegotiation, addNegotiationQuote, setRecommendationSummary, addBooking, resetDemo, setError } = useStore();
  const activeLoad = state.loads.find((l) => l.id === state.activeLoadId);

  const loadQuotes = activeLoad
    ? state.quotes.filter((q) => q.loadId === activeLoad.id)
    : [];

  const round1Quotes = loadQuotes.filter((q) => q.round === 1);
  const round2Quotes = loadQuotes.filter((q) => q.round === 2);

  const handleNegotiate = async () => {
    startNegotiation();

    try {
      const activeLoad = state.loads.find((l) => l.id === state.activeLoadId);
      if (!activeLoad) throw new Error('No active load');

      const comparison = compareRound1Quotes(round1Quotes);
      if (!comparison.shouldNegotiate || !comparison.negotiationTarget) {
        throw new Error('No negotiation target — gap too small');
      }

      const quote = await negotiateWithCarrier(
        activeLoad.id,
        comparison.negotiationTarget.carrierId,
        comparison.lowestQuote.quotedRate!
      );

      addNegotiationQuote(quote);

      // Generate AI summary after successful negotiation
      const finalResult = determineFinalWinner(round1Quotes, quote);
      const summary = await generateRecommendationSummary(
        activeLoad.id,
        finalResult.winner.carrierId,
        finalResult.winner.quotedRate!,
        finalResult.runnerUp.carrierId,
        finalResult.runnerUp.quotedRate!,
        finalResult.savingsVsOriginal,
        finalResult.savingsVsNextBest,
        finalResult.wasNegotiated
      );
      setRecommendationSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Negotiation failed');
    }
  };

  const handleBookCarrier = async () => {
    try {
      const activeLoad = state.loads.find((l) => l.id === state.activeLoadId);
      if (!activeLoad) throw new Error('No active load');

      const finalResult = determineFinalWinner(round1Quotes, round2Quotes[0]);
      
      const booking = await createBooking(
        activeLoad.id,
        finalResult.winner.id,
        finalResult.winner.quotedRate!,
        finalResult.savingsVsOriginal,
        finalResult.savingsVsNextBest
      );

      addBooking(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    }
  };

  const showNegotiateButton =
    round1Quotes.length === 2 &&
    round2Quotes.length === 0 &&
    activeLoad?.status === 'quoted';

  const showFinalComparison = round2Quotes.length > 0 && activeLoad?.status !== 'booked';

  let finalResult = null;
  if (showFinalComparison && round1Quotes.length >= 2) {
    finalResult = determineFinalWinner(round1Quotes, round2Quotes[0]);
  }

  const isBooked = activeLoad?.status === 'booked';

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SupplyLine</h1>
          <p className="text-sm text-gray-500">Freight Sourcing Agent</p>
        </div>
        {isBooked && (
          <button
            onClick={resetDemo}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset Demo
          </button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Load Board</h2>
      </div>

      {activeLoad && <LoadCard load={activeLoad} />}

      {round1Quotes.length > 0 && !isBooked && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-md font-semibold text-gray-800">Round 1 Quotes</h3>
          <div className="space-y-3">
            {round1Quotes.map((quote) => {
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
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {quote.quotedRate ? `$${quote.quotedRate.toLocaleString()}` : 'No quote'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {showNegotiateButton && (
            <button
              onClick={handleNegotiate}
              disabled={state.isSourcing}
              className={`mt-4 rounded-md px-4 py-2 text-sm font-medium ${
                state.isSourcing
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {state.isSourcing ? 'Negotiating...' : 'Negotiate Best Rate'}
            </button>
          )}
        </div>
      )}

      {showFinalComparison && finalResult && (
        <div className="mt-6 rounded-lg border-2 border-green-200 bg-green-50 p-6 shadow-sm">
          <h3 className="mb-4 text-md font-semibold text-green-900">Final Recommendation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {state.carriers.find((c) => c.id === finalResult.winner.carrierId)?.name}
                  {finalResult.wasNegotiated && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Negotiated
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {finalResult.wasNegotiated
                    ? 'Rate secured through negotiation'
                    : 'Best original quote'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-700">
                  ${finalResult.winner.quotedRate?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-md bg-white p-4">
              <div>
                <p className="text-xs text-gray-500">Saved vs original quote</p>
                <p className="text-lg font-semibold text-green-600">
                  ${finalResult.savingsVsOriginal.toLocaleString()}
                  {finalResult.savingsVsOriginal > 0 && (
                    <span className="ml-1 text-sm">
                      ({Math.round((finalResult.savingsVsOriginal / (finalResult.winner.quotedRate! + finalResult.savingsVsOriginal)) * 100)}%)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Saved vs next best</p>
                <p className="text-lg font-semibold text-green-600">
                  ${finalResult.savingsVsNextBest.toLocaleString()}
                </p>
              </div>
            </div>

            {state.recommendationSummary && (
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  AI Recommendation
                </p>
                <p className="mt-1 text-sm text-blue-900">
                  {state.recommendationSummary}
                </p>
              </div>
            )}

            <button
              onClick={handleBookCarrier}
              className="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              Book Carrier
            </button>
          </div>
        </div>
      )}

      {isBooked && <BookingConfirmation />}

      {loadQuotes.length > 0 && <CallTranscript />}

      {state.error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">
          <p className="text-sm font-medium">Error: {state.error}</p>
        </div>
      )}
    </div>
  );
}
