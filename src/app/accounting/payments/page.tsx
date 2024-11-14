'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PaymentForm from '@/components/accounting/PaymentForm';
import PaymentList from '@/components/accounting/PaymentList';

const MotionDiv = motion.div;

type Tab = 'new' | 'history';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('new');

  return (
    <div className="p-6">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm rounded-lg p-6 mb-6"
      >
        <h1 className="text-2xl font-bold mb-6">Payments</h1>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('new')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'new'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              New Payment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              Payment History
            </button>
          </nav>
        </div>
      </MotionDiv>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <MotionDiv
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'new' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'new' ? (
            <div className="max-w-2xl mx-auto">
              <PaymentForm />
            </div>
          ) : (
            <PaymentList />
          )}
        </MotionDiv>
      </div>
    </div>
  );
}
