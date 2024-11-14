'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'يناير', value: 400 },
  { name: 'فبراير', value: 300 },
  { name: 'مارس', value: 600 },
  { name: 'أبريل', value: 800 },
  { name: 'مايو', value: 700 },
  { name: 'يونيو', value: 900 },
];

const ParticleBackground = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderRadius: '50%',
          }}
          animate={{
            x: [Math.random() * dimensions.width, Math.random() * dimensions.width],
            y: [Math.random() * dimensions.height, Math.random() * dimensions.height],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  percentage,
}: {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  percentage?: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2.5rem' }}>{icon}</span>
        {trend && percentage && (
          <div
            style={{
              color: trend === 'up' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
              fontSize: '0.875rem',
              fontWeight: 'bold',
            }}
          >
            {trend === 'up' ? '↑' : '↓'} {percentage}
          </div>
        )}
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', direction: 'rtl' }}>
        {value}
      </h3>
      <p style={{ color: 'rgb(199, 210, 254)', direction: 'rtl' }}>{title}</p>
    </motion.div>
  );
};

export default function LandingPage() {
  const [hoveredChart, setHoveredChart] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-indigo-950 to-purple-900 text-white overflow-hidden">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '1rem',
                  background:
                    'linear-gradient(to bottom right, rgb(99, 102, 241), rgb(168, 85, 247), rgb(236, 72, 153))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.25)',
                }}
              >
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white' }}>B</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>برناي</h1>
                <p style={{ fontSize: '1.25rem', color: 'rgb(199, 210, 254)' }}>حلول النقل</p>
              </div>
            </div>
          </motion.div>

          <motion.h2
            style={{
              fontSize: '3.75rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textAlign: 'center',
              background: 'linear-gradient(to right, rgb(199, 210, 254), rgb(216, 180, 254), rgb(244, 114, 182))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              direction: 'rtl',
            }}
            animate={{
              opacity: [0.8, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            لوحة التحكم الرئيسية
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '1.25rem',
              color: 'rgb(199, 210, 254)',
              marginBottom: '3rem',
              maxWidth: '42rem',
              margin: '0 auto',
              textAlign: 'center',
              direction: 'rtl',
            }}
          >
            مقاييس الأداء والتحليل في الوقت الفعلي
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '5rem',
          }}
        >
          <StatCard title="السائقين النشطين" value="62" icon="🚗" trend="up" percentage="5%" />
          <StatCard title="الإيرادات الشهرية" value="84,500.00 KWD" icon="💰" trend="up" percentage="12%" />
          <StatCard title="مستوى الأداء" value="72%" icon="📈" trend="down" percentage="3%" />
          <StatCard title="استخدام الأسطول" value="89%" icon="🚚" trend="up" percentage="7%" />
        </div>

        {/* Chart Section */}
        <motion.div
          style={{
            padding: '2rem',
            borderRadius: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '5rem',
          }}
          whileHover={{ boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)' }}
          onHoverStart={() => setHoveredChart(true)}
          onHoverEnd={() => setHoveredChart(false)}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', direction: 'rtl' }}>
            الأداء المالي
          </h3>
          <div style={{ height: '300px', direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Driver Distribution Section */}
        <motion.div
          style={{
            padding: '2rem',
            borderRadius: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '5rem',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', direction: 'rtl' }}>
            توزيع السائقين
          </h3>
          <div
            style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', direction: 'rtl' }}
          >
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.25rem', color: 'rgb(34, 197, 94)' }}>نشط</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>45</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.25rem', color: 'rgb(234, 179, 8)' }}>في إجازة</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>8</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.25rem', color: 'rgb(239, 68, 68)' }}>موقوف</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '1.25rem', color: 'rgb(148, 163, 184)' }}>غير نشط</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>6</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          style={{ display: 'flex', justifyContent: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center px-12 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg overflow-hidden transition-all duration-300"
          >
            <motion.span
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(168, 85, 247))',
                opacity: 0,
                transition: 'opacity 0.3s',
              }}
              initial={false}
              animate={hoveredChart ? { scale: 1.1 } : { scale: 1 }}
            />
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              استكشف لوحة التحكم
              <motion.svg
                style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.5rem', transform: 'scaleX(-1)' }}
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Animated Background Gradients */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -10, overflow: 'hidden' }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom left, rgba(99, 102, 241, 0.2), transparent)',
            borderRadius: '50%',
            filter: 'blur(64px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '-50%',
            left: '-50%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top right, rgba(168, 85, 247, 0.2), transparent)',
            borderRadius: '50%',
            filter: 'blur(64px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}
