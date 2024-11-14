'use client';

import { HTMLMotionProps, motion } from 'framer-motion';

interface LoadingSpinnerProps extends HTMLMotionProps<'div'> {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary', ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      {...props}
    >
      <div className={`animate-spin rounded-full border-b-2 border-${color} ${sizeClasses[size]}`} />
    </motion.div>
  );
}
