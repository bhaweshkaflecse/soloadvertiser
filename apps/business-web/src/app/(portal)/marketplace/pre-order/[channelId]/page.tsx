// Solo Advertiser — Business Portal
// PG-BIZ-041: Pre-Order Form
// Submit interest/pre-order for a non-live advertising channel

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/page-header';

const CAMPAIGN_OBJECTIVES = [
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'event_promotion', label: 'Event Promotion' },
  { value: 'seasonal_campaign', label: 'Seasonal Campaign' },
  { value: 'local_targeting', label: 'Local Targeting' },
  { value: 'national_reach', label: 'National Reach' },
];

const DURATION_OPTIONS = [
  { value: '1_month', label: '1 Month' },
  { value: '3_months', label: '3 Months' },
  { value: '6_months', label: '6 Months' },
  { value: '12_months', label: '12 Months' },
];

const LAUNCH_OPTIONS = [
  { value: 'Q1 2025', label: 'Q1 2025' },
  { value: 'Q2 2025', label: 'Q2 2025' },
  { value: 'Q3 2025', label: 'Q3 2025' },
  { value: 'Q4 2025', label: 'Q4 2025' },
  { value: '2026', label: '2026' },
];

export default function PreOrderPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    estimatedBudget: '',
    preferredCity: '',
    campaignDuration: '',
    expectedLaunch: '',
    campaignObjectives: [] as string[],
    preferredStartDate: '',
    additionalNotes: '',
  });

  const handleObjectiveToggle = (value: string) => {
    setForm((prev) => ({
      ...prev,
      campaignObjectives: prev.campaignObjectives.includes(value)
        ? prev.campaignObjectives.filter((o) => o !== value)
        : [...prev.campaignObjectives, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Pre-Order Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your interest. We will notify you when this channel becomes available.
        </p>
        <div className="flex justify-center gap-3">
          <a href="/marketplace" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Explore More Channels
          </a>
          <a href="/dashboard" className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Pre-Order Advertising"
        description="Reserve your spot for when this channel goes live"
      />

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Budget (NPR) *
          </label>
          <input
            type="number"
            required
            min={1000}
            value={form.estimatedBudget}
            onChange={(e) => setForm((p) => ({ ...p, estimatedBudget: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. 50000"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred City *
          </label>
          <input
            type="text"
            required
            value={form.preferredCity}
            onChange={(e) => setForm((p) => ({ ...p, preferredCity: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Kathmandu"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Duration *
          </label>
          <select
            required
            value={form.campaignDuration}
            onChange={(e) => setForm((p) => ({ ...p, campaignDuration: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select duration...</option>
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Expected Launch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Launch Period *
          </label>
          <select
            required
            value={form.expectedLaunch}
            onChange={(e) => setForm((p) => ({ ...p, expectedLaunch: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select launch period...</option>
            {LAUNCH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Campaign Objectives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Objectives *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CAMPAIGN_OBJECTIVES.map((obj) => (
              <label key={obj.value} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={form.campaignObjectives.includes(obj.value)}
                  onChange={() => handleObjectiveToggle(obj.value)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">{obj.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Start Date (optional)
          </label>
          <input
            type="date"
            value={form.preferredStartDate}
            onChange={(e) => setForm((p) => ({ ...p, preferredStartDate: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            rows={3}
            value={form.additionalNotes}
            onChange={(e) => setForm((p) => ({ ...p, additionalNotes: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any specific requirements or questions..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Pre-Order'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
