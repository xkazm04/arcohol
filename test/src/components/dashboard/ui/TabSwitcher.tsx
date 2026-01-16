'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

export interface TabItem {
  id: string;
  label: string;
  description?: string;
}

interface TabSwitcherProps {
  tabs: TabItem[];
  urlParamKey: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  layoutId?: string;
}

/**
 * Universal TabSwitcher with URL parameter synchronization.
 * Updates URL query params when tabs change, enabling bidirectional sync with sidebar navigation.
 */
export function TabSwitcher({
  tabs,
  urlParamKey,
  defaultTab,
  onChange,
  className = '',
  layoutId = 'tabIndicator',
}: TabSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or use default
  const urlValue = searchParams.get(urlParamKey);
  const activeTab = urlValue && tabs.some(t => t.id === urlValue) ? urlValue : (defaultTab || tabs[0]?.id);

  const handleTabChange = useCallback((tabId: string) => {
    // Build new URL with updated param
    const params = new URLSearchParams(searchParams.toString());
    params.set(urlParamKey, tabId);

    // Update URL without full page refresh
    router.push(`?${params.toString()}`, { scroll: false });

    // Call optional onChange handler
    onChange?.(tabId);
  }, [router, searchParams, urlParamKey, onChange]);

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pb-2 ${className}`}>
      {tabs.map((tab, index) => (
        <motion.button
          key={tab.id}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTabChange(tab.id)}
          className={`relative px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all border ${
            activeTab === tab.id
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : 'bg-slate-900/50 text-slate-400 border-slate-800/40 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-cyan-500/10 rounded-lg border border-cyan-500/30"
              style={{ boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

/**
 * Hook to get the current tab value from URL params.
 * Useful when you need the active tab value in component logic.
 */
export function useTabValue(urlParamKey: string, tabs: TabItem[], defaultTab?: string): string {
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(urlParamKey);
  return urlValue && tabs.some(t => t.id === urlValue) ? urlValue : (defaultTab || tabs[0]?.id);
}
