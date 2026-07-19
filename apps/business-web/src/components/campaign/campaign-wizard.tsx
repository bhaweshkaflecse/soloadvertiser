// Solo Advertiser — Business Portal
// Campaign creation wizard component (4-step flow)
// Used by the new campaign page for guided creation

'use client';

import { ReactNode } from 'react';

interface WizardStep {
  id: string;
  label: string;
}

interface CampaignWizardProps {
  steps: WizardStep[];
  currentStep: number;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  showBack?: boolean;
}

export default function CampaignWizard({
  steps,
  currentStep,
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  showBack = true,
}: CampaignWizardProps) {
  return (
    <div>
      {/* Step progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className="ml-2 text-sm text-gray-600 hidden md:inline">{step.label}</span>
            {i < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 mx-2 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6">
        {children}
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        {showBack && currentStep > 0 ? (
          <button onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Back
          </button>
        ) : <div />}
        {onNext && (
          <button onClick={onNext} className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
