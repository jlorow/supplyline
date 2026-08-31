# SupplyLine

**AI freight-sourcing agent using CALL-E for phone-based carrier negotiation.**

Built for the [CALL-E Hackathon](https://call-e.devpost.com/) — targets **Most Innovative Use Case** ($3,000) with **Most Practical Use Case** ($4,000) as secondary.

## What It Does

SupplyLine automates freight broker workflows for the API-less economy:

1. **Source Carriers** — Calls multiple trucking carriers via CALL-E to get live rate quotes
2. **Compare & Rank** — Deterministic code compares quotes, identifies the best rate, and decides if negotiation is worth it
3. **Negotiate** — Calls the higher-quoted carrier back with the competing rate and asks them to match or beat it
4. **Recommend & Book** — Generates an AI-powered recommendation summary and lets the broker book the winning carrier with one click
5. **View Transcripts** — Full call transcripts and structured evidence for every quote

## Demo Scenario

- **Load:** Chicago, IL → Atlanta, GA | Dry Van | 43,000 lbs | Sept 1, 2026
- **Carrier A:** Rockridge Transport LLC — quotes $1,800
- **Carrier B:** Prairie Line Carriers — quotes $1,650
- **Negotiation:** SupplyLine calls Rockridge back with Prairie Line's $1,650 rate
- **Result:** Rockridge matches down to $1,620 — **$180 saved** vs their original quote, **$30 better** than Prairie Line

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- CALL-E SDK (`@call-e/calle`)
- Kimi API (`moonshot-v1-8k`) for recommendation summaries
- React Context for state
- In-memory data store (MVP)

## Architecture

```
src/
├── app/
│   ├── actions.ts          # Server actions — CALL-E SDK calls + Kimi summaries
│   ├── page.tsx            # Load dashboard
│   └── layout.tsx          # Root layout with StoreProvider
├── components/
│   ├── LoadDashboard.tsx   # Main dashboard — quotes, negotiation, booking
│   ├── LoadCard.tsx        # Individual load card
│   ├── BookingConfirmation.tsx
│   ├── CallTranscript.tsx
│   └── StatusBadge.tsx
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── data.ts             # Demo data + initial state
│   ├── store.tsx           # React Context + state management
│   ├── calle.ts            # CALL-E task templates + mock functions
│   ├── comparison.ts       # Deterministic quote comparison logic
│   └── kimi.ts             # Kimi API client with mock fallback
└── schemas/
    └── quote-schema.ts     # CALL-E structured result schemas
```

## Key Design Decisions

- **Deterministic comparison:** All quote ranking, threshold decisions, and savings math is pure code — no LLM involved. Fast, auditable, and correct.
- **LLM only for summaries:** Kimi generates the human-readable recommendation explanation. The numbers come from code.
- **Server actions for CALL-E:** All SDK calls run server-side to protect API keys.
- **Mock mode:** `MOCK_CALLS=true` enables build verification without real phone calls.

## Setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_APP_NAME=SupplyLine
CALLE_API_KEY=your_calle_api_key_here
KIMI_API_KEY=your_kimi_api_key_here
MOCK_CALLS=true    # Set to false for real phone calls
```

```bash
npm run dev
```

## Running the Demo

1. Click **"Source Carriers"** — simulates Round 1 calls to Rockridge and Prairie Line
2. Click **"Negotiate Best Rate"** — simulates Round 2 call to Rockridge with Prairie Line's rate
3. Review the **Final Recommendation** with AI summary and savings
4. Click **"Book Carrier"** — creates a booking record
5. View **Call Transcripts** below
6. Click **"Reset Demo"** to run again

## Hackathon Submission

- **Repo:** https://github.com/jlorow/supplyline
- **Primary track:** Most Innovative Use Case ($3,000)
- **Secondary track:** Most Practical Use Case ($4,000)
- **Innovation:** Two-round sequential calling with dynamic negotiation task composition — a capability not demonstrated in CALL-E's own examples
- **Practicality:** Solves a real $50B+ market problem (freight spot market negotiation) using live phone calls to API-less carriers

## Notes

- This is a hackathon MVP. In production, loads would come from a TMS or load board via webhook.
- The negotiation mechanic uses intentional friction in the demo transcript ("Well, $1,650 is tight for us...") to prove CALL-E handles real conversation dynamics, not scripted agreement.
- All comparison and savings calculations are deterministic — the LLM only generates the human-readable summary.
