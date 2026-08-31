'use server';

import { CalleClient } from '@call-e/calle';
import { Load, Carrier, Quote } from '@/lib/types';
import { initialLoads, initialCarriers } from '@/lib/data';
import {
  createQuoteTask,
  createNegotiationTask,
  mockCallCarriersForQuotes,
  mockNegotiateWithCarrier,
} from '@/lib/calle';
import { taskResultSchema, recipientResultSchema } from '@/schemas/quote-schema';

const calleClient = new CalleClient({
  apiKey: process.env.CALLE_API_KEY || '',
});

const MOCK_CALLS = process.env.MOCK_CALLS === 'true';

/**
 * Server Action: Round 1 — call all carriers for quotes.
 */
export async function callCarriersForQuotes(loadId: string): Promise<Quote[]> {
  const load = initialLoads.find((l) => l.id === loadId);
  if (!load) throw new Error(`Load ${loadId} not found`);

  const carriers = initialCarriers;

  if (MOCK_CALLS) {
    return mockCallCarriersForQuotes(load, carriers);
  }

  const task = createQuoteTask(load);

  const response = await calleClient.calls.createAndWait({
    task,
    recipients: carriers.map((c) => ({
      phones: [c.phoneNumber],
      locale: 'en-US',
    })),
    resultSchema: taskResultSchema,
    recipientResultSchema: recipientResultSchema,
  });

  const quotes: Quote[] = [];
  const now = new Date().toISOString();

  for (const carrier of carriers) {
    const recipientResult = response.recipients?.find(
      (r) => r.phones.includes(carrier.phoneNumber)
    );

    if (recipientResult?.structuredResult) {
      const sr = recipientResult.structuredResult;
      quotes.push({
        id: `quote-${load.id}-${carrier.id}-r1`,
        loadId: load.id,
        carrierId: carrier.id,
        round: 1,
        available: (['yes', 'no', 'unknown'].includes(sr.available as string) ? (sr.available as 'yes' | 'no' | 'unknown') : 'unknown'),
        quotedRate: typeof sr.quoted_rate === 'number' ? sr.quoted_rate : null,
        pickupConfirmed: (['yes', 'no', 'unknown'].includes(sr.pickup_confirmed as string) ? (sr.pickup_confirmed as 'yes' | 'no' | 'unknown') : 'unknown'),
        evidence: (sr.evidence as string) || '',
        transcript: recipientResult.summary || '',
        timestamp: now,
      });
    } else {
      quotes.push({
        id: `quote-${load.id}-${carrier.id}-r1`,
        loadId: load.id,
        carrierId: carrier.id,
        round: 1,
        available: 'unknown',
        quotedRate: null,
        pickupConfirmed: 'unknown',
        evidence: 'No structured result returned from call.',
        transcript: recipientResult?.summary || '',
        timestamp: now,
      });
    }
  }

  return quotes;
}

/**
 * Server Action: Round 2 — call the higher-quoted carrier back to negotiate.
 */
export async function negotiateWithCarrier(
  loadId: string,
  carrierId: string,
  competingRate: number
): Promise<Quote> {
  const load = initialLoads.find((l) => l.id === loadId);
  if (!load) throw new Error(`Load ${loadId} not found`);

  const carrier = initialCarriers.find((c) => c.id === carrierId);
  if (!carrier) throw new Error(`Carrier ${carrierId} not found`);

  if (MOCK_CALLS) {
    return mockNegotiateWithCarrier(load, carrier, competingRate);
  }

  const task = createNegotiationTask(load, competingRate);

  const response = await calleClient.calls.createAndWait({
    task,
    recipients: [{
      phones: [carrier.phoneNumber],
      locale: 'en-US',
    }],
    resultSchema: taskResultSchema,
    recipientResultSchema: recipientResultSchema,
  });

  const now = new Date().toISOString();

  const recipientResult = response.recipients?.[0];

  if (recipientResult?.structuredResult) {
    const sr = recipientResult.structuredResult;
    return {
      id: `quote-${load.id}-${carrier.id}-r2`,
      loadId: load.id,
      carrierId: carrier.id,
      round: 2,
      available: (['yes', 'no', 'unknown'].includes(sr.available as string) ? (sr.available as 'yes' | 'no' | 'unknown') : 'unknown'),
      quotedRate: typeof sr.quoted_rate === 'number' ? sr.quoted_rate : null,
      pickupConfirmed: (['yes', 'no', 'unknown'].includes(sr.pickup_confirmed as string) ? (sr.pickup_confirmed as 'yes' | 'no' | 'unknown') : 'unknown'),
      evidence: (sr.evidence as string) || '',
      transcript: recipientResult.summary || '',
      timestamp: now,
    };
  }

  return {
    id: `quote-${load.id}-${carrier.id}-r2`,
    loadId: load.id,
    carrierId: carrier.id,
    round: 2,
    available: 'unknown',
    quotedRate: null,
    pickupConfirmed: 'unknown',
    evidence: 'No structured result returned from negotiation call.',
    transcript: recipientResult?.summary || '',
    timestamp: now,
  };
}
