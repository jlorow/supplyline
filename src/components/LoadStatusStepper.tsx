'use client';

import { Load } from '@/lib/types';
import { Phone, Handshake, Scale, Check } from 'lucide-react';

interface LoadStatusStepperProps {
  status: Load['status'];
  isSourcing?: boolean;
  currentRound?: 0 | 1 | 2;
  negotiationCount?: number;
}

type StepIndex = 0 | 1 | 2 | 3;

const STEPS = [
  { label: 'Sourcing', Icon: Phone },
  { label: 'Negotiating', Icon: Handshake },
  { label: 'Comparing', Icon: Scale },
  { label: 'Ready to Book', Icon: Check },
] as const;

function getStepIndex(status: Load['status']): StepIndex {
  switch (status) {
    case 'uncovered':
    case 'sourcing':
      return 0;
    case 'negotiating':
      return 1;
    case 'quoted':
    case 'recommended':
      return 2;
    case 'booked':
      return 3;
  }
}

/**
 * Returns true when the action for a given step is actually in flight,
 * based on the real store flags — not just step-index equality.
 *
 * Step 0 (Sourcing):  isSourcing && currentRound === 1
 * Step 1 (Negotiating): isSourcing && currentRound === 2
 * Step 2 (Comparing): No action-in-progress flag exists (synchronous comparison)
 * Step 3 (Ready to Book): No action-in-progress flag exists (no booking loading state)
 */
function isStepActionInProgress(
  stepIdx: StepIndex,
  isSourcing: boolean,
  currentRound: 0 | 1 | 2,
): boolean {
  switch (stepIdx) {
    case 0:
      return isSourcing && currentRound === 1;
    case 1:
      return isSourcing && currentRound === 2;
    case 2:
    case 3:
      return false;
  }
}

function getSublabel(
  stepIdx: StepIndex,
  activeStep: StepIndex,
  actionInProgress: boolean,
  negotiationCount?: number,
): string {
  if (stepIdx !== activeStep) {
    return '';
  }
  if (!actionInProgress) {
    return 'Pending';
  }
  // Action is confirmed underway for the active step
  if (stepIdx === 1 && negotiationCount !== undefined) {
    return `${negotiationCount} active`;
  }
  return 'In progress';
}

export default function LoadStatusStepper({
  status,
  isSourcing = false,
  currentRound = 0,
  negotiationCount,
}: LoadStatusStepperProps) {
  const activeStep = getStepIndex(status);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const stepIdx = idx as StepIndex;
        const isCompleted = idx < activeStep;
        const isActive = idx === activeStep;
        const actionInProgress = isActive && isStepActionInProgress(stepIdx, isSourcing, currentRound);

        const circleClass = isActive || isCompleted
          ? 'bg-brand text-white'
          : 'bg-surface-page border border-surface-border text-ink-subtle';

        const labelClass = isActive || isCompleted
          ? 'text-ink'
          : 'text-ink-subtle';

        const sublabelClass = isActive && actionInProgress
          ? 'text-brand'
          : 'text-ink-subtle';

        const sublabelText = getSublabel(stepIdx, activeStep, actionInProgress, negotiationCount);
        const showSublabel = isActive && sublabelText !== '';

        return (
          <div key={step.label} className="flex items-center">
            {/* Step circle + text */}
            <div className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${circleClass}`}>
                <step.Icon size={18} />
              </div>
              <span className={`mt-1.5 text-center text-xs font-semibold ${labelClass}`}>
                {step.label}
              </span>
              {showSublabel && (
                <span className={`text-xs font-medium ${sublabelClass}`}>
                  {sublabelText}
                </span>
              )}
            </div>

            {/* Connecting line (after all but last) */}
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-8 ${
                  idx < activeStep ? 'bg-brand' : 'bg-surface-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
