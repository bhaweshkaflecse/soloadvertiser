'use client';

import { PageHeader } from '@/components/layout/page-header';

/**
 * PG-ADM-090: Reports Hub
 * Central hub for generating and viewing platform reports.
 */
export default function ReportsPage() {
  const reportCategories = [
    {
      title: 'Financial Reports',
      icon: '💰',
      reports: [
        { name: 'Revenue Summary', description: 'Monthly/quarterly revenue breakdown' },
        { name: 'Payout History', description: 'Rider payout records and totals' },
        { name: 'Outstanding Payments', description: 'Pending business payments' },
      ],
    },
    {
      title: 'Operations Reports',
      icon: '📊',
      reports: [
        { name: 'Rider Performance', description: 'Score distribution and activity metrics' },
        { name: 'Campaign Analytics', description: 'Campaign reach, completion rates' },
        { name: 'Zone Coverage', description: 'Coverage density by geographic zone' },
      ],
    },
    {
      title: 'Growth Reports',
      icon: '📈',
      reports: [
        { name: 'User Acquisition', description: 'New riders and businesses over time' },
        { name: 'Retention Metrics', description: 'Active user retention rates' },
        { name: 'Platform KPIs', description: 'Key performance indicators dashboard' },
      ],
    },
  ];

  return (
    <div>
      <PageHeader title="Reports" breadcrumbs={[{ label: 'Reports' }]} subtitle="Generate and download platform reports" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCategories.map((category) => (
          <div key={category.title} className="bg-white rounded-lg border">
            <div className="p-4 border-b flex items-center gap-2">
              <span className="text-xl">{category.icon}</span>
              <h2 className="font-semibold">{category.title}</h2>
            </div>
            <ul className="divide-y">
              {category.reports.map((report) => (
                <li key={report.name}>
                  <button className="w-full text-left p-4 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
