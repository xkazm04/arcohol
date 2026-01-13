'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  color?: string;
}

interface FormSelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

export function FormSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
  hint,
  size = 'md',
  disabled = false,
  searchable,
  className = '',
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search for 5+ options
  const showSearch = searchable ?? options.length >= 5;

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = search
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      onChange?.(filteredOptions[0].value);
      setIsOpen(false);
      setSearch('');
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px] min-h-[28px]',
    md: 'px-2.5 py-1.5 text-xs min-h-[34px]',
    lg: 'px-3 py-2 text-sm min-h-[42px]',
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] text-slate-500 uppercase mb-1 block tracking-wide">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2
          ${sizeClasses[size]}
          bg-slate-800 border border-slate-700 rounded
          text-left
          focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
          ${isOpen ? 'border-cyan-500/50 ring-2 ring-cyan-500/20' : ''}
          ${error ? 'border-red-500/50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-all duration-200
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption?.color && (
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span className={selectedOption ? 'text-white' : 'text-slate-500'}>
            {selectedOption?.label || placeholder}
          </span>
        </span>

        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-slate-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700/50 rounded-lg shadow-xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            {showSearch && (
              <div className="p-2 border-b border-slate-800">
                <div className="relative">
                  <svg
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    whileHover={{ x: 2 }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left
                      ${option.value === value ? 'bg-cyan-500/10 text-cyan-400' : 'text-white hover:bg-slate-800'}
                      transition-colors
                    `}
                  >
                    {option.icon}
                    {option.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.value === value && (
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(error || hint) && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-[10px] mt-1 ${error ? 'text-red-400' : 'text-slate-500'}`}
        >
          {error || hint}
        </motion.p>
      )}
    </div>
  );
}
