'use client';

import { useState } from 'react';
import { categories, templates, type Category, type Template } from './_lib';
import { Icon, CodePreview } from './_components';

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
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Code Generator</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Generate integration code for common patterns: checkout buttons, payment forms, subscription flows.
            Copy-paste solutions with best practices and error handling built in.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Panel: Filters & List */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  const first = templates.find((t) => t.category === c);
                  if (first) setSelected(first);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                  category === c
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-300'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          {/* Template List */}
          <div className="flex-1 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 overflow-y-auto p-2 space-y-2">
            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm italic">
                No templates found for this category.
              </div>
            )}
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full p-4 rounded-xl border text-left transition-all group duration-200 ${
                  selected.id === t.id
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-transparent border-transparent hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selected.id === t.id
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    <Icon name={t.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-sm font-medium mb-1 ${selected.id === t.id ? 'text-white' : 'text-slate-300'}`}>
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{t.desc}</div>
                    <div className="text-xs text-orange-400/60">{t.useCase}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Tips Card */}
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-orange-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>PRO TIP</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Always use environment variables for keys. Never commit your secret keys to git.
            </p>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-white px-2">{selected.name}</span>
              <div className="h-4 w-px bg-slate-700" />
              <input
                type="text"
                placeholder="Project ID (Optional)"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:ring-0 w-48"
              />
            </div>
            <button
              onClick={copy}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                copied
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                  : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy Snippet
                </>
              )}
            </button>
          </div>

          {/* Editor Window */}
          <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Window Controls */}
            <div className="bg-[#252526] px-4 py-2 flex items-center gap-2 border-b border-black/20">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-4 text-xs font-mono text-slate-500">{selected.id}.tsx</span>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <CodePreview code={selected.code} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
