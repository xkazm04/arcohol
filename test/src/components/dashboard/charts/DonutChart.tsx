'use client';

import { motion } from 'framer-motion';

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 120,
  strokeWidth = 20,
  showLegend = true,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segments
  let currentOffset = 0;
  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const length = percentage * circumference;
    const offset = currentOffset;
    currentOffset += length;
    return {
      ...item,
      percentage,
      length,
      offset,
    };
  });

  return (
    <div className="flex items-center gap-4">
      {/* Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(51, 65, 85, 0.3)"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((segment, index) => (
            <motion.circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${segment.length} ${circumference - segment.length}` }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </svg>

        {/* Center text */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-white"
              >
                {centerValue}
              </motion.span>
            )}
            {centerLabel && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[10px] text-slate-400"
              >
                {centerLabel}
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-1.5">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: segment.color }} />
              <span className="text-[10px] text-slate-400 min-w-[80px]">{segment.label}</span>
              <span className="text-[10px] font-mono text-white">{segment.value}</span>
              <span className="text-[9px] text-slate-500">({Math.round(segment.percentage * 100)}%)</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
