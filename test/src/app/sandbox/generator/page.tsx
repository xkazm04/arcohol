'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, templates, type Category, type Template } from './_lib';
import { Icon, CodePreview } from './_components';
import { Card, CardHeader, GlowButton, FilterTabs, staggerContainer, listItem } from '@/components/dashboard';

export default function GeneratorPage() {
  const [category, setCategory] = useState<Category>('setup');
  const [selected, setSelected] = useState<Template>(templates[0]);
  const [copied, setCopied] = useState(false);
  const [projectId, setProjectId] = useState('');

  const filtered = templates.filter((t) => t.category === category);

  const copy = () => {
    let copyText = selected.code;
    if (projectId) {
      copyText = copyText.replace(/process\.env\.[A-Z_]+/g, `"${projectId}"`);
    }
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 h-[calc(100vh-100px)] flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between shrink-0"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white mb-1"
            style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.3)' }}
          >
            Code Generator
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Generate integration code for common patterns with best practices built in.
          </p>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Panel: Filters & List */}
        <motion.div variants={listItem} className="col-span-4 flex flex-col gap-3">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c, index) => (
              <motion.button
                key={c}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => {
                  setCategory(c);
                  const first = templates.find((t) => t.category === c);
                  if (first) setSelected(first);
                }}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all border ${
                  category === c
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800/40 hover:text-slate-300'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Template List */}
          <div className="flex-1 relative bg-slate-900/50 rounded-lg border border-slate-800/40 overflow-y-auto p-2 space-y-1.5">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-orange-500/30 rounded-tl" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-orange-500/30 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-orange-500/30 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-orange-500/30 rounded-br" />

            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No templates found for this category.
              </div>
            )}
            <AnimatePresence mode="wait">
              {filtered.map((t, index) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 3 }}
                  onClick={() => setSelected(t)}
                  className={`w-full p-3 rounded-lg border text-left transition-all group duration-200 ${
                    selected.id === t.id
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-transparent border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-1.5 rounded-lg ${
                        selected.id === t.id
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      <Icon name={t.icon} className="w-3.5 h-3.5" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium mb-0.5 ${selected.id === t.id ? 'text-white' : 'text-slate-300'}`}>
                        {t.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{t.desc}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Tips Card */}
          <motion.div
            variants={listItem}
            className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-3 overflow-hidden"
          >
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-amber-500/30 rounded-tl" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-amber-500/30 rounded-tr" />

            <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-orange-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>PRO TIP</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Always use environment variables for keys. Never commit secrets to git.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Panel: Code Editor */}
        <motion.div variants={listItem} className="col-span-8 flex flex-col gap-3">
          {/* Toolbar */}
          <div className="relative flex items-center justify-between bg-slate-900/50 rounded-lg border border-slate-800/40 p-2.5 overflow-hidden">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-cyan-500/30 rounded-tl" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-cyan-500/30 rounded-tr" />

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white px-1">{selected.name}</span>
              <div className="h-4 w-px bg-slate-700" />
              <input
                type="text"
                placeholder="Project ID (Optional)"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-[10px] text-white placeholder-slate-600 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-40"
              />
            </div>
            <GlowButton
              size="sm"
              variant={copied ? 'secondary' : 'primary'}
              onClick={copy}
              icon={
                copied ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )
              }
            >
              {copied ? 'Copied!' : 'Copy'}
            </GlowButton>
          </div>

          {/* Editor Window */}
          <div className="flex-1 relative bg-[#1e1e1e] rounded-lg border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-emerald-500/30 rounded-tl z-10" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-emerald-500/30 rounded-tr z-10" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-emerald-500/30 rounded-bl z-10" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-emerald-500/30 rounded-br z-10" />

            {/* Window Controls */}
            <div className="bg-[#252526] px-3 py-2 flex items-center gap-2 border-b border-black/20">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-3 text-[10px] font-mono text-slate-500">{selected.id}.tsx</span>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <CodePreview code={selected.code} />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
