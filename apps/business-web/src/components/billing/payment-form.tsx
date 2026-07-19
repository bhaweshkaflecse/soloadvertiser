// Solo Advertiser — Business Portal
// Payment form component for manual payment proof upload
// Supports bank transfer, UPI, and cheque methods

'use client';

import { useState, FormEvent } from 'react';
import FileUpload from '@/components/shared/file-upload';
import { formatCurrency } from '@/lib/utils';

interface PaymentFormProps {
  maxAmount: number;
  onSubmit: (data: {
    method: string;
    amount: number;
    reference: string;
    paidDate: string;
    proofFile?: File;
  }) => void;
  isSubmitting?: boolean;
}

export default function PaymentForm({ maxAmount, onSubmit, isSubmitting }: PaymentFormProps) {
  const [method, setMethod] = useState('bank_transfer');
  const [amount, setAmount] = useState(maxAmount);
  const [reference, setReference] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofFile, setProofFile] = useState<File | undefined>();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ method, amount, reference, paidDate, proofFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment method */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {[
            { id: 'bank_transfer', label: 'Bank Transfer' },
            { id: 'upi', label: 'UPI' },
            { id: 'cheque', label: 'Cheque' },
          ].map((opt) => (
            <label key={opt.id} className={`flex items-center justify-center p-3 border rounded-md cursor-pointer
              ${method === opt.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
              <input type="radio" name="method" value={opt.id}
                checked={method === opt.id}
                onChange={() => setMethod(opt.id)}
                className="sr-only" />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount *</label>
        <div className="mt-1 relative">
          <span className="absolute left-3 top-2 text-gray-500">₹</span>
          <input type="number" required min={1} max={maxAmount} value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <p className="text-xs text-gray-500 mt-1">Maximum: {formatCurrency(maxAmount)}</p>
      </div>

      {/* Reference number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Reference / Transaction ID *</label>
        <input type="text" required value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="e.g. UTR number, cheque number" />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Date *</label>
        <input type="date" required value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>

      {/* Proof upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Proof</label>
        <p className="text-xs text-gray-500 mb-2">Upload screenshot or receipt (optional but recommended)</p>
        <FileUpload
          accept="image/*,.pdf"
          onFile={(file) => setProofFile(file)}
        />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium">
        {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
      </button>
    </form>
  );
}
