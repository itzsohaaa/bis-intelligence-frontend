import { Fragment, type ReactNode } from "react";
import { safeSourceUrl } from "@/lib/bis/normalize";

// Deliberately small Markdown subset. React escapes all text; no HTML injection,
// embedded images, or automatic links. Unsupported syntax stays readable text.
function inline(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|\[[^\]\n]+\]\([^\s)]+\))/g);
  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) return <code key={index} className="rounded bg-canvas px-1 font-mono text-[0.9em]">{token.slice(1, -1)}</code>;
    if ((token.startsWith("**") && token.endsWith("**")) || (token.startsWith("__") && token.endsWith("__"))) return <strong key={index} className="font-semibold">{token.slice(2, -2)}</strong>;
    if (token.startsWith("*") && token.endsWith("*")) return <em key={index}>{token.slice(1, -1)}</em>;
    const link = token.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    const href = link && safeSourceUrl(link[2]);
    if (link && href) return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-4 focus-visible:outline-2">{link[1]}<span className="sr-only"> (opens in a new tab)</span></a>;
    return <Fragment key={index}>{token}</Fragment>;
  });
}

export function FormattedAnswer({ text }: { text: string }) {
  const lines = text.replace(/\r\n?/g, "\n").replace(/\\([#*_`>\[\]])/g, "$1").split("\n");
  const blocks: ReactNode[] = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (heading) { blocks.push(<h4 key={i} className="pt-2 font-semibold leading-7">{inline(heading[1])}</h4>); i++; continue; }
    const list = line.match(/^(?:([-+*])|(\d+)[.)])\s+(.+)$/);
    if (list) {
      const start = i;
      const ordered = Boolean(list[2]);
      const items: ReactNode[] = [];
      while (i < lines.length) {
        const item = lines[i].trim().match(/^(?:([-+*])|(\d+)[.)])\s+(.+)$/);
        if (!item || Boolean(item[2]) !== ordered) break;
        items.push(<li key={i}>{inline(item[3])}</li>); i++;
      }
      blocks.push(ordered ? <ol key={start} start={Number(list[2])} className="list-decimal space-y-2 pl-6">{items}</ol> : <ul key={start} className="list-disc space-y-2 pl-6">{items}</ul>);
      continue;
    }
    blocks.push(<p key={i} className="whitespace-pre-wrap">{inline(lines[i])}</p>); i++;
  }
  return <div className="min-w-0 space-y-3 leading-7 [overflow-wrap:anywhere]">{blocks}</div>;
}
