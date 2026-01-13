'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface FilterTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'sm' | 'md';
  variant?: 'pills' | 'underline';
  className?: string;
}

export function FilterTabs({
  tabs,
  activeTab,
  onChange,
  size = 'sm',
  variant = 'pills',
  className = '',
}: FilterTabsProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  };

  if (variant === 'underline') {
    return (
      <div className={`flex gap-4 border-b border-slate-800 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative pb-2"
          >
            <span
              className={`
                flex items-center gap-1.5 ${sizeClasses[size]} font-medium
                ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
                transition-colors
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] font-mono">
                  {tab.count}
                </span>
              )}
            </span>

            {activeTab === tab.id && (
              <motion.div
                layoutId="underline-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Pills variant (default)
  return (
    <div className={`flex gap-1 p-0.5 bg-slate-900/60 rounded-lg ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative flex items-center gap-1.5
            ${sizeClasses[size]}
            font-medium rounded
            transition-colors
            ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
          `}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="pill-indicator"
              className="absolute inset-0 bg-slate-800 rounded"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`
                  px-1 py-0.5 rounded text-[9px] font-mono
                  ${activeTab === tab.id ? 'bg-slate-700' : 'bg-slate-800/50'}
                `}
              >
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

// Simpler button group variant
interface ButtonGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function ButtonGroup({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
}: ButtonGroupProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <div className={`inline-flex rounded-lg overflow-hidden border border-slate-700 ${className}`}>
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            ${sizeClasses[size]}
            font-medium
            ${value === option.value
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }
            ${index > 0 ? 'border-l border-slate-700' : ''}
            transition-colors
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
