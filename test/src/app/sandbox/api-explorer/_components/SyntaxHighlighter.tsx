export function SyntaxHighlighter({ code }: { code: string }) {
  // Simple syntax highlighting for JSON
  const html = code.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'text-amber-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-cyan-400'; // key
        } else {
          cls = 'text-green-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-red-400'; // null
      }
      return '<span class="' + cls + '">' + match + '</span>';
    }
  );

  return (
    <pre
      className="font-mono text-[11px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
