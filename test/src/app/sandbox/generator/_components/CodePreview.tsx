export function CodePreview({ code }: { code: string }) {
  return <pre className="font-mono text-xs leading-relaxed text-slate-300">{code}</pre>;
}
