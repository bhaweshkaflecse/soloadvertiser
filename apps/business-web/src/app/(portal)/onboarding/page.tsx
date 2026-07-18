// Solo Advertiser — Business Portal
// PG-BIZ-010: Onboarding Wizard
// 3-step wizard: Company Info → Documents → Complete
// Required before accessing the main portal features

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type OnboardingStep = 'company' | 'documents' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('company');
  const [companyData, setCompanyData] = useState({
    name: '',
    registrationNumber: '',
    industry: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactPhone: '',
  });

  const steps = [
    { id: 'company', label: 'Company Info' },
    { id: 'documents', label: 'Documents' },
    { id: 'complete', label: 'Complete' },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${i <= currentIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {i + 1}
              </div>
              <span className="ml-2 text-sm text-gray-600">{s.label}</span>
              {i < steps.length - 1 && <div className="w-16 h-0.5 mx-4 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 'company' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Company Information</h2>
          <p className="text-gray-600 mb-6">Tell us about your business to get started.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                <input type="text" required value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <input type="text" value={companyData.registrationNumber}
                  onChange={(e) => setCompanyData({ ...companyData, registrationNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select value={companyData.industry}
                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select industry</option>
                <option value="retail">Retail</option>
                <option value="food_beverage">Food & Beverage</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Address</label>
              <input type="text" value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input type="text" placeholder="City" value={companyData.city}
                onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input type="text" placeholder="State" value={companyData.state}
                onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              <input type="text" placeholder="Pincode" value={companyData.pincode}
                onChange={(e) => setCompanyData({ ...companyData, pincode: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setStep('documents')}
              className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
              Next: Documents
            </button>
          </div>
        </div>
      )}

      {step === 'documents' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Company Documents</h2>
          <p className="text-gray-600 mb-6">Upload required business documents for verification.</p>
          <div className="space-y-4">
            {['Business Registration Certificate', 'GST Certificate', 'Company Logo'].map((doc) => (
              <div key={doc} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="font-medium">{doc}</p>
                <p className="text-sm text-gray-500 mt-1">Drop file here or click to upload</p>
                <button className="mt-2 text-blue-600 text-sm hover:underline">Choose File</button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep('company')} className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Back
            </button>
            <button onClick={() => setStep('complete')} className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
              Submit
            </button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Onboarding Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your company profile is under review. You&apos;ll be notified once verified (usually within 24-48 hours).
          </p>
          <button onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
