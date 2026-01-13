'use client';

import { motion } from 'framer-motion';

interface TrendLineProps {
  data: { label: string; value: number }[];
  height?: number;
  showDots?: boolean;
  showLabels?: boolean;
  accent?: 'cyan' | 'orange' | 'emerald' | 'purple' | 'amber';
}

const accentColors = {
  cyan: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.1)', dot: 'bg-cyan-400' },
  orange: { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.1)', dot: 'bg-orange-400' },
  emerald: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)', dot: 'bg-emerald-400' },
  purple: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.1)', dot: 'bg-purple-400' },
  amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)', dot: 'bg-amber-400' },
};

export function TrendLine({ data, height = 80, showDots = true, showLabels = true, accent = 'cyan' }: TrendLineProps) {
  if (data.length === 0) return null;

  const colors = accentColors[accent];
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  const padding = 10;
  const chartHeight = height - 20;
  const chartWidth = 100; // percentage-based

  // Generate SVG path points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((d.value - min) / range) * chartHeight + padding;
    return { x, y, value: d.value, label: d.label };
  });

  // Create SVG path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create area path (for fill)
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight + padding} L 0 ${chartHeight + padding} Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${height}`} preserveAspectRatio="none">
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`gradient-${accent}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill={`url(#gradient-${accent})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Dots overlay */}
      {showDots && (
        <div className="absolute inset-0 flex items-stretch justify-between px-0">
          {points.map((point, i) => (
            <div key={i} className="relative flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`absolute w-2 h-2 rounded-full ${colors.dot} shadow-lg`}
                style={{
                  top: `${(1 - (point.value - min) / range) * (chartHeight / height) * 100 + 10}%`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Labels */}
      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {data.map((d, i) => (
            <span key={i} className="text-[9px] text-slate-500">
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
