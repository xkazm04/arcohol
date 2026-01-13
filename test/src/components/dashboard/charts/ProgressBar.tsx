'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  accent?: 'cyan' | 'orange' | 'emerald' | 'purple' | 'amber' | 'red';
}

const accentColors = {
  cyan: 'bg-cyan-500 shadow-cyan-500/30',
  orange: 'bg-orange-500 shadow-orange-500/30',
  emerald: 'bg-emerald-500 shadow-emerald-500/30',
  purple: 'bg-purple-500 shadow-purple-500/30',
  amber: 'bg-amber-500 shadow-amber-500/30',
  red: 'bg-red-500 shadow-red-500/30',
};

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({ value, max = 100, label, showValue = true, size = 'md', accent = 'cyan' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-[10px] text-slate-400">{label}</span>}
          {showValue && <span className="text-[10px] font-mono text-white">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-800/50 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full shadow-lg ${accentColors[accent]}`}
        />
      </div>
    </div>
  );
}
