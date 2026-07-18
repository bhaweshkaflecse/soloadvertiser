// Solo Advertiser — Business Portal
// PG-BIZ-004: Forgot Password Page
// Email input to request password reset link

'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Call password reset API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset link sent</h2>
        <p className="text-gray-600 mb-6">
          If an account exists for {email}, you&apos;ll receive a password reset link shortly.
        </p>
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@company.com"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="text-blue-600 hover:underline">
          Back to login
        </Link>
      </p>
    </>
  );
}
