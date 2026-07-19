// Solo Advertiser — Business Portal
// PG-BIZ-060: Company Profile Settings
// View and edit company information

'use client';

import { useState } from 'react';
import PageHeader from '@/components/layout/page-header';

export default function CompanySettingsPage() {
  const [companyData, setCompanyData] = useState({
    name: 'Acme Corporation',
    registrationNumber: 'CIN123456789',
    industry: 'technology',
    address: '123 Business Park',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    contactPhone: '+91 9876543210',
    contactEmail: 'business@acme.com',
  });

  const handleSave = () => {
    // TODO: Save company profile via API
    console.log('Save company:', companyData);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Company Profile" description="Manage your company information" />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Logo upload */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">A</span>
            </div>
            <button className="text-sm text-blue-600 hover:underline">Change Logo</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" value={companyData.name}
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
              <option value="retail">Retail</option>
              <option value="food_beverage">Food & Beverage</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
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

          <div className="flex justify-end mt-6">
            <button onClick={handleSave}
              className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
