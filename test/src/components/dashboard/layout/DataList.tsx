'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listItem, staggerContainer } from '../utils/animations';
import { StatusType, statusColors } from '../utils/colors';

interface DataListProps {
  children: ReactNode;
  className?: string;
}

export function DataList({ children, className = '' }: DataListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`divide-y divide-slate-800/30 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Data list item
interface DataListItemProps {
  children: ReactNode;
  onClick?: () => void;
  status?: StatusType | string;
  showStatusBorder?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function DataListItem({
  children,
  onClick,
  status,
  showStatusBorder = false,
  actions,
  className = '',
}: DataListItemProps) {
  const statusConfig = status ? statusColors[status as StatusType] : null;

  return (
    <motion.div
      variants={listItem}
      whileHover={{ x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={`
        relative px-3 py-2.5 group
        transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${showStatusBorder && statusConfig ? `border-l-2 ${statusConfig.border}` : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">{children}</div>

        {actions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Animated list for adding/removing items
interface AnimatedListProps {
  items: { id: string; content: ReactNode }[];
  onRemove?: (id: string) => void;
  className?: string;
}

export function AnimatedList({ items, onRemove, className = '' }: AnimatedListProps) {
  return (
    <div className={`divide-y divide-slate-800/30 ${className}`}>
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={listItem}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="relative px-3 py-2.5 group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">{item.content}</div>

              {onRemove && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(item.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded text-red-400 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Compact list header
interface DataListHeaderProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function DataListHeader({ children, action, className = '' }: DataListHeaderProps) {
  return (
    <div className={`px-3 py-2 border-b border-slate-800/40 flex items-center justify-between bg-slate-800/20 ${className}`}>
      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
        {children}
      </div>
      {action}
    </div>
  );
}

// List empty state
interface DataListEmptyProps {
  message?: string;
  icon?: ReactNode;
}

export function DataListEmpty({ message = 'No items', icon }: DataListEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-3 py-8 text-center"
    >
      {icon && <div className="text-slate-600 mb-2">{icon}</div>}
      <p className="text-xs text-slate-500">{message}</p>
    </motion.div>
  );
}
