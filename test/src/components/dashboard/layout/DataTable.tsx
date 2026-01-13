'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listItem, staggerContainer } from '../utils/animations';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const sortedData = sortColumn
    ? [...data].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const direction = sortDirection === 'asc' ? 1 : -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * direction;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * direction;
        }
        return 0;
      })
    : data;

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className={`
          grid gap-2 px-3 py-2 border-b border-slate-800/40 bg-slate-800/20
          text-[10px] font-medium text-slate-500 uppercase tracking-wide
          ${stickyHeader ? 'sticky top-0 z-10' : ''}
        `}
        style={{
          gridTemplateColumns: columns.map((col) => col.width || '1fr').join(' '),
        }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={`${alignClasses[column.align || 'left']} ${
              column.sortable ? 'cursor-pointer hover:text-slate-300 transition-colors' : ''
            }`}
            onClick={column.sortable ? () => handleSort(column.key) : undefined}
          >
            <span className="inline-flex items-center gap-1">
              {column.header}
              {column.sortable && sortColumn === column.key && (
                <motion.svg
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: sortDirection === 'desc' ? 180 : 0 }}
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </motion.svg>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Body */}
      {sortedData.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 py-8 text-center text-xs text-slate-500"
        >
          {emptyMessage}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-slate-800/30"
        >
          <AnimatePresence>
            {sortedData.map((item, index) => (
              <motion.div
                key={String(item[keyField])}
                variants={listItem}
                whileHover={onRowClick ? { x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' } : undefined}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={`
                  grid gap-2 px-3 py-2.5 items-center
                  transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                style={{
                  gridTemplateColumns: columns.map((col) => col.width || '1fr').join(' '),
                }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`${alignClasses[column.align || 'left']} min-w-0`}
                  >
                    {column.render
                      ? column.render(item, index)
                      : (item[column.key] as ReactNode)}
                  </div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

// Simple grid-based table row for custom layouts
interface TableRowProps {
  children: ReactNode;
  columns: number | string;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, columns, onClick, className = '' }: TableRowProps) {
  const gridCols = typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns;

  return (
    <motion.div
      variants={listItem}
      whileHover={onClick ? { x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' } : undefined}
      onClick={onClick}
      className={`
        grid gap-2 px-3 py-2.5 items-center
        transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{ gridTemplateColumns: gridCols }}
    >
      {children}
    </motion.div>
  );
}

// Table cell
interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  span?: number;
  className?: string;
}

export function TableCell({ children, align = 'left', span = 1, className = '' }: TableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={`${alignClasses[align]} min-w-0 ${className}`}
      style={span > 1 ? { gridColumn: `span ${span}` } : undefined}
    >
      {children}
    </div>
  );
}
