// Solo Advertiser — Business Portal
// PG-BIZ-041: Payment Submission Page
// Campaign cost display + payment form (method, amount, reference, date, proof upload)

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import type { Campaign } from '@/types';
import { formatCurrency } from '@/lib/utils';
import PaymentForm from '@/components/billing/payment-form';
import LoadingSkeleton from '@/components/shared/loading-skeleton';

interface PayPageProps {
  params: { campaignId: string };
}

export default function PaymentSubmissionPage({ params }: PayPageProps) {
  const router = useRouter();
  const { data: campaign, isLoading } = useApi<Campaign>(`/campaigns/${params.campaignId}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <LoadingSkeleton className="h-64" />;
  if (!campaign) return <div>Campaign not found</div>;

  const outstanding = campaign.totalBudget - campaign.amountPaid;

  const handleSubmit = async (paymentData: {
    method: string;
    amount: number;
    reference: string;
    paidDate: string;
    proofFile?: File;
  }) => {
    setIsSubmitting(true);
    try {
      // TODO: Submit payment proof to API
      console.log('Payment submitted:', paymentData);
      router.push('/billing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Submit Payment</h1>
      <p className="text-gray-600 mb-6">Campaign: {campaign.name}</p>

      {/* Payment summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-lg font-bold">{formatCurrency(campaign.totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Already Paid</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(campaign.amountPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(outstanding)}</p>
          </div>
        </div>
      </div>

      {/* Payment form */}
      <div className="bg-white rounded-lg shadow p-6">
        <PaymentForm
          maxAmount={outstanding}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
