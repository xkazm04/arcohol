'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { listItem, staggerContainer } from '../utils/animations';
import { AccentColor, accentClasses } from '../utils/colors';

interface ActivityItem {
  id: string;
  icon?: ReactNode;
  iconColor?: AccentColor;
  title: string;
  description?: string;
  meta?: string;
  value?: string;
  valueColor?: 'positive' | 'negative' | 'neutral';
  time?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  emptyMessage?: string;
  className?: string;
}

export function ActivityFeed({
  items,
  maxItems,
  showViewAll = false,
  onViewAll,
  emptyMessage = 'No activity',
  className = '',
}: ActivityFeedProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  const valueColorClasses = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-white',
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-3 py-8 text-center text-xs text-slate-500"
      >
        {emptyMessage}
      </motion.div>
    );
  }

  return (
    <div className={className}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="divide-y divide-slate-800/30"
      >
        {displayItems.map((item) => {
          const iconColorClasses = item.iconColor ? accentClasses[item.iconColor] : accentClasses.cyan;

          return (
            <motion.div
              key={item.id}
              variants={listItem}
              whileHover={{ x: 2, backgroundColor: 'rgba(51, 65, 85, 0.15)' }}
              className="px-3 py-2.5 flex items-center gap-3 transition-colors"
            >
              {/* Icon */}
              {item.icon && (
                <div className={`p-1.5 rounded-lg ${iconColorClasses.bg} ${iconColorClasses.border} border`}>
                  <div className={`w-3.5 h-3.5 ${iconColorClasses.text}`}>{item.icon}</div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white truncate">{item.title}</span>
                  {item.meta && (
                    <span className="text-[10px] text-slate-600">{item.meta}</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                )}
              </div>

              {/* Value and time */}
              <div className="flex-shrink-0 text-right">
                {item.value && (
                  <div
                    className={`text-xs font-mono ${
                      valueColorClasses[item.valueColor || 'neutral']
                    }`}
                  >
                    {item.value}
                  </div>
                )}
                {item.time && (
                  <div className="text-[10px] text-slate-600">{item.time}</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* View all link */}
      {showViewAll && items.length > (maxItems || 0) && (
        <div className="px-3 py-2 border-t border-slate-800/40">
          <button
            onClick={onViewAll}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all ({items.length})
          </button>
        </div>
      )}
    </div>
  );
}

// Compact activity item for inline use
interface CompactActivityProps {
  icon?: ReactNode;
  iconColor?: AccentColor;
  children: ReactNode;
  value?: string;
  valueColor?: 'positive' | 'negative' | 'neutral';
  time?: string;
  className?: string;
}

export function CompactActivity({
  icon,
  iconColor = 'cyan',
  children,
  value,
  valueColor = 'neutral',
  time,
  className = '',
}: CompactActivityProps) {
  const iconColorClasses = accentClasses[iconColor];

  const valueColorClasses = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-white',
  };

  return (
    <motion.div
      variants={listItem}
      whileHover={{ x: 2 }}
      className={`flex items-center gap-2 py-1.5 ${className}`}
    >
      {icon && (
        <div className={`p-1 rounded ${iconColorClasses.bg}`}>
          <div className={`w-3 h-3 ${iconColorClasses.text}`}>{icon}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 text-xs text-slate-400 truncate">
        {children}
      </div>

      {value && (
        <span className={`text-xs font-mono ${valueColorClasses[valueColor]}`}>
          {value}
        </span>
      )}

      {time && (
        <span className="text-[10px] text-slate-600">{time}</span>
      )}
    </motion.div>
  );
}
