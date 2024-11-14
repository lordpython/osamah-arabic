'use client';

import { HTMLMotionProps, motion } from 'framer-motion';
import { useState } from 'react';

import AttendanceTable from '@/components/hr/AttendanceTable';
import DriverManagement from '@/components/hr/DriverManagement';
import PerformanceMetrics from '@/components/hr/PerformanceMetrics';

// Define proper types for motion components
type MotionDivProps = HTMLMotionProps<'div'> & {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

type MotionButtonProps = HTMLMotionProps<'button'> & {
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  key?: string;
  whileHover?: object;
  whileTap?: object;
};

const MotionDiv = motion.div as React.FC<MotionDivProps>;
const MotionButton = motion.button as React.FC<MotionButtonProps>;

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1rem' }}
    >
      <div className="glass-effect rounded-2xl p-8 mb-8">
        <h1 className="text-4xl font-black gradient-text mb-8">Brunai HR Operations Dashboard</h1>

        <nav className="flex space-x-6">
          {['attendance', 'drivers', 'performance'].map((tab) => (
            <MotionButton
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                textTransform: 'capitalize',
                transition: 'all 300ms',
                background: activeTab === tab ? 'var(--primary)' : 'white',
                color: activeTab === tab ? 'white' : 'inherit',
              }}
            >
              {tab}
            </MotionButton>
          ))}
        </nav>
      </div>

      <MotionDiv
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '2rem',
          borderRadius: '1rem',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {activeTab === 'attendance' && <AttendanceTable />}
        {activeTab === 'drivers' && <DriverManagement />}
        {activeTab === 'performance' && <PerformanceMetrics />}
      </MotionDiv>
    </MotionDiv>
  );
}
