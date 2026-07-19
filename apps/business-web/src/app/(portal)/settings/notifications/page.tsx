// Solo Advertiser — Business Portal
// PG-BIZ-062: Notification Preferences
// Toggle email and in-app notification types

'use client';

import { useState } from 'react';
import PageHeader from '@/components/layout/page-header';

interface NotificationPref {
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPref[]>([
    { label: 'Campaign Updates', description: 'Status changes, rider assignments', email: true, inApp: true },
    { label: 'Payment Confirmations', description: 'Payment verified or rejected', email: true, inApp: true },
    { label: 'Rider Milestones', description: 'Capacity filled, campaign started', email: false, inApp: true },
    { label: 'Support Updates', description: 'New replies on your tickets', email: true, inApp: true },
    { label: 'Monthly Reports', description: 'Campaign performance summaries', email: true, inApp: false },
    { label: 'System Announcements', description: 'Platform updates and maintenance', email: false, inApp: true },
  ]);

  const togglePref = (index: number, field: 'email' | 'inApp') => {
    setPreferences((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: !p[field] } : p))
    );
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Notification Preferences" description="Choose how you want to be notified" />

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <span className="font-medium">Notification Type</span>
          <div className="flex gap-8">
            <span className="text-sm font-medium text-gray-600 w-12 text-center">Email</span>
            <span className="text-sm font-medium text-gray-600 w-12 text-center">In-App</span>
          </div>
        </div>
        <div className="divide-y">
          {preferences.map((pref, index) => (
            <div key={pref.label} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{pref.label}</p>
                <p className="text-sm text-gray-500">{pref.description}</p>
              </div>
              <div className="flex gap-8">
                <div className="w-12 flex justify-center">
                  <input type="checkbox" checked={pref.email}
                    onChange={() => togglePref(index, 'email')}
                    className="w-4 h-4 text-blue-600 rounded" />
                </div>
                <div className="w-12 flex justify-center">
                  <input type="checkbox" checked={pref.inApp}
                    onChange={() => togglePref(index, 'inApp')}
                    className="w-4 h-4 text-blue-600 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
