// Solo Advertiser — Business Portal
// PG-BIZ-031: Campaign Creation Wizard
// 4-step wizard: Details → Capacity/Creative → Budget Summary → Confirm

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BudgetCalculator from '@/components/campaign/budget-calculator';
import type { CampaignFormData } from '@/types';

type WizardStep = 'details' | 'capacity' | 'budget' | 'confirm';

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('details');
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    wrapType: 'full',
    targetRiders: 10,
    durationDays: 30,
    dailyRatePerRider: 500,
    zoneIds: [],
  });

  const steps = [
    { id: 'details', label: 'Campaign Details' },
    { id: 'capacity', label: 'Capacity & Creative' },
    { id: 'budget', label: 'Budget Summary' },
    { id: 'confirm', label: 'Confirm & Submit' },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  const updateField = (field: keyof CampaignFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalBudget = formData.targetRiders * formData.durationDays * formData.dailyRatePerRider;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${i <= currentIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {i + 1}
            </div>
            <span className="ml-2 text-sm text-gray-600 hidden md:inline">{s.label}</span>
            {i < steps.length - 1 && <div className="w-8 md:w-16 h-0.5 mx-2 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Campaign Details */}
      {step === 'details' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Campaign Name *</label>
              <input type="text" required value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. Summer Sale Promotion" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea rows={3} value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Brief description of the campaign objectives" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Wrap Type</label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {(['full', 'partial', 'rear'] as const).map((type) => (
                  <label key={type} className={`flex items-center justify-center p-3 border rounded-md cursor-pointer
                    ${formData.wrapType === type ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                    <input type="radio" name="wrapType" value={type} checked={formData.wrapType === type}
                      onChange={() => updateField('wrapType', type)} className="sr-only" />
                    <span className="capitalize">{type} Wrap</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setStep('capacity')}
              className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
              Next: Capacity
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Capacity & Creative */}
      {step === 'capacity' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Capacity & Creative</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Riders</label>
                <input type="number" min={1} max={500} value={formData.targetRiders}
                  onChange={(e) => updateField('targetRiders', parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                <input type="number" min={7} max={365} value={formData.durationDays}
                  onChange={(e) => updateField('durationDays', parseInt(e.target.value) || 7)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Creative Upload</label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500">Drag & drop your wrap design or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Accepted: AI, PDF, PNG, JPG (max 50MB)</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep('details')} className="px-6 py-2 border border-gray-300 rounded-md">Back</button>
            <button onClick={() => setStep('budget')} className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">Next: Budget</button>
          </div>
        </div>
      )}

      {/* Step 3: Budget Summary */}
      {step === 'budget' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Budget Summary</h2>
          <BudgetCalculator
            riders={formData.targetRiders}
            days={formData.durationDays}
            dailyRate={formData.dailyRatePerRider}
            onRateChange={(rate) => updateField('dailyRatePerRider', rate)}
          />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Campaign Budget</span>
              <span className="text-2xl font-bold text-blue-800">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBudget)}
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep('capacity')} className="px-6 py-2 border border-gray-300 rounded-md">Back</button>
            <button onClick={() => setStep('confirm')} className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">Next: Review</button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm & Submit */}
      {step === 'confirm' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b"><dt className="text-gray-600">Campaign Name</dt><dd className="font-medium">{formData.name}</dd></div>
            <div className="flex justify-between py-2 border-b"><dt className="text-gray-600">Wrap Type</dt><dd className="font-medium capitalize">{formData.wrapType}</dd></div>
            <div className="flex justify-between py-2 border-b"><dt className="text-gray-600">Target Riders</dt><dd className="font-medium">{formData.targetRiders}</dd></div>
            <div className="flex justify-between py-2 border-b"><dt className="text-gray-600">Duration</dt><dd className="font-medium">{formData.durationDays} days</dd></div>
            <div className="flex justify-between py-2 border-b"><dt className="text-gray-600">Daily Rate / Rider</dt><dd className="font-medium">₹{formData.dailyRatePerRider}</dd></div>
            <div className="flex justify-between py-2"><dt className="text-gray-600 font-semibold">Total Budget</dt><dd className="font-bold text-blue-800">₹{totalBudget.toLocaleString('en-IN')}</dd></div>
          </dl>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep('budget')} className="px-6 py-2 border border-gray-300 rounded-md">Back</button>
            <button onClick={() => { /* TODO: Submit campaign */ router.push('/campaigns'); }}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Submit Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
