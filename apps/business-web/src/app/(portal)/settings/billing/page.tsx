// Solo Advertiser — Business Portal
// PG-BIZ-061: Billing Details Settings
// Manage payment methods and billing information

'use client';

import { useState } from 'react';
import PageHeader from '@/components/layout/page-header';

export default function BillingSettingsPage() {
  const [billingInfo, setBillingInfo] = useState({
    bankName: 'HDFC Bank',
    accountNumber: '****1234',
    ifsc: 'HDFC0001234',
    upiId: 'business@hdfcbank',
    gstNumber: 'GST123456789',
    billingEmail: 'billing@acme.com',
  });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Billing Details" description="Manage your payment information" />

      {/* Current payment method */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <p className="text-sm text-gray-600 mb-4">
          All payments are manual (bank transfer / UPI). Provide details for our records.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input type="text" value={billingInfo.bankName}
                onChange={(e) => setBillingInfo({ ...billingInfo, bankName: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input type="text" value={billingInfo.accountNumber}
                onChange={(e) => setBillingInfo({ ...billingInfo, accountNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
              <input type="text" value={billingInfo.ifsc}
                onChange={(e) => setBillingInfo({ ...billingInfo, ifsc: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">UPI ID</label>
              <input type="text" value={billingInfo.upiId}
                onChange={(e) => setBillingInfo({ ...billingInfo, upiId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Tax info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">GST Number</label>
            <input type="text" value={billingInfo.gstNumber}
              onChange={(e) => setBillingInfo({ ...billingInfo, gstNumber: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Billing Email</label>
            <input type="email" value={billingInfo.billingEmail}
              onChange={(e) => setBillingInfo({ ...billingInfo, billingEmail: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
