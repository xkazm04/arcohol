'use client';

import { motion } from 'framer-motion';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showValues?: boolean;
  maxValue?: number;
  accent?: 'cyan' | 'orange' | 'emerald' | 'purple' | 'amber';
}

const accentColors = {
  cyan: { bar: 'bg-cyan-500', glow: 'shadow-cyan-500/30' },
  orange: { bar: 'bg-orange-500', glow: 'shadow-orange-500/30' },
  emerald: { bar: 'bg-emerald-500', glow: 'shadow-emerald-500/30' },
  purple: { bar: 'bg-purple-500', glow: 'shadow-purple-500/30' },
  amber: { bar: 'bg-amber-500', glow: 'shadow-amber-500/30' },
};

export function BarChart({ data, height = 120, showValues = true, maxValue, accent = 'cyan' }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const colors = accentColors[accent];

  return (
    <div className="flex items-end gap-2 justify-between" style={{ height }}>
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={item.label} className="flex flex-col items-center flex-1 h-full">
            <div className="flex-1 w-full flex items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(percentage, 2)}%` }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                className={`w-full max-w-[32px] rounded-t ${item.color || colors.bar} shadow-lg ${colors.glow}`}
              />
            </div>
            {showValues && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-[10px] font-mono text-white mt-1"
              >
                {item.value}
              </motion.span>
            )}
            <span className="text-[9px] text-slate-500 mt-0.5 truncate max-w-full">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
