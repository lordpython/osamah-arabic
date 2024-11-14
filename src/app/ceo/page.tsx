'use client';

import { motion } from 'framer-motion';

import CEODashboard from '@/components/dashboard/CEODashboard';

export default function CEOPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '1.5rem',
      }}
    >
      <div className="glass-effect rounded-2xl p-8 mb-8">
        <h1 className="text-4xl font-black gradient-text mb-8">Brunai Executive Dashboard</h1>
      </div>

      <div className="space-y-6">
        <CEODashboard />
      </div>
    </motion.div>
  );
}
