import { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Rendu Markdown minimal et sûr (aucun HTML injecté)                  */
/* ------------------------------------------------------------------ */

function inline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>;
    if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) return <em key={`${key}-${i}`}>{part.slice(1, -1)}</em>;
    return <span key={`${key}-${i}`}>{part}</span>;
  });
}

export default function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = (k: number) => {
    if (list.length) blocks.push(<ul key={`ul-${k}`}>{list.map((li, i) => <li key={i}>{inline(li, `li-${k}-${i}`)}</li>)}</ul>);
    list = [];
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^\s*[-*•]\s+/.test(line)) { list.push(line.replace(/^\s*[-*•]\s+/, "")); return; }
    if (/^\s*\d+[.)]\s+/.test(line)) { list.push(line.replace(/^\s*\d+[.)]\s+/, "")); return; }
    flush(i);
    if (!line.trim()) return;
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) blocks.push(<h5 key={i}>{inline(h[1], `h-${i}`)}</h5>);
    else blocks.push(<p key={i}>{inline(line, `p-${i}`)}</p>);
  });
  flush(-1);
  return <>{blocks}</>;
}

