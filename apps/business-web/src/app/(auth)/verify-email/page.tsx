// Solo Advertiser — Business Portal
// PG-BIZ-003: Email Verification Page
// Shows verification status and resend option

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      // TODO: Call resend verification email API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResent(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
      <p className="text-gray-600 mb-6">
        We&apos;ve sent a verification link to your email address. Click the link to verify your account.
      </p>

      {resent && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Verification email resent successfully!
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={isResending}
        className="text-blue-600 hover:underline disabled:opacity-50"
      >
        {isResending ? 'Resending...' : 'Resend verification email'}
      </button>

      <div className="mt-6">
        <Link href="/login" className="text-sm text-gray-500 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
