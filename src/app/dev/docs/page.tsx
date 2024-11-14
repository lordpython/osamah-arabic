'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function DevDocs() {
  useEffect(() => {
    // @ts-ignore
    if (window.mermaid) {
      // @ts-ignore
      window.mermaid.initialize({
        theme: 'default',
        securityLevel: 'loose',
      });
      // @ts-ignore
      window.mermaid.init();
    }
  }, []);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/mermaid@10.2.3/dist/mermaid.min.js" strategy="afterInteractive" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Developer Documentation</h1>

          {/* Database Schema Section */}
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Database Schema</h2>
            <div className="overflow-x-auto">
              <pre className="mermaid">
                {`
erDiagram
    DRIVERS {
        uuid id PK
        text name
        enum status
        timestamp created_at
        timestamp updated_at
    }

    EMPLOYEE_RECORDS {
        uuid id PK
        text name
        text position
        text department
        timestamp created_at
        timestamp updated_at
    }

    ATTENDANCE {
        uuid attendance_id PK
        uuid employee_id FK
        date date
        enum status
        timestamp created_at
    }

    ACCOUNTING_ENTRIES {
        serial entry_id PK
        date date
        enum type
        decimal amount
        text description
        text category
        timestamp created_at
        timestamp updated_at
    }

    DRIVERS ||--o{ DRIVER_DAILY_PERFORMANCE : "has performance"
    EMPLOYEE_RECORDS ||--o{ ATTENDANCE : "has attendance"
                `}
              </pre>
            </div>
          </section>

          {/* Real-time Flow Section */}
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Real-time Data Flow</h2>
            <div className="overflow-x-auto">
              <pre className="mermaid">
                {`
flowchart TD
    A[Client Dashboard] -->|Subscribe| B{Supabase Realtime}
    B -->|Changes| C[drivers]
    B -->|Changes| D[accounting_entries]
    B -->|Changes| E[daily_order_metrics]
    B -->|Changes| F[monthly_order_metrics]
    B -->|Changes| G[driver_daily_performance]
    
    C -->|Update| H[DriverStatusChart]
    D -->|Update| I[MetricCards]
    E -->|Update| J[OrderMetrics Daily]
    F -->|Update| K[OrderMetrics Monthly]
    G -->|Update| L[Performance Metrics]
                `}
              </pre>
            </div>
          </section>

          {/* Table Details */}
          <section className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Core Tables Overview</h2>

              <div className="space-y-4">
                {/* Drivers Table */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Drivers Table</h3>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Column
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">id</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">uuid</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Unique identifier</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">name</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">text</td>
                          <td className="px-6 py-4 text-sm text-gray-500">Driver&apos;s full name</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">status</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">enum</td>
                          <td className="px-6 py-4 text-sm text-gray-500">active, on_leave, suspended, inactive</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Subscriptions */}
          <section className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Real-time Subscriptions</h2>
            <div className="prose max-w-none">
              <ul className="list-disc pl-5 space-y-2">
                <li>drivers - Status changes trigger DriverStatusChart updates</li>
                <li>accounting_entries - New entries update revenue metrics</li>
                <li>daily_order_metrics - Updates daily performance charts</li>
                <li>monthly_order_metrics - Updates monthly trends</li>
                <li>driver_daily_performance - Updates driver performance metrics</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
