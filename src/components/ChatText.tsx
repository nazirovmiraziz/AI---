import { Fragment, useState } from "react";

function inlineBits(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g);
  return parts.filter(Boolean).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={i} className="chat-code-inline">{part.slice(1, -1)}</code>;
    }
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const italic = part.match(/^\*(.+)\*$/);
    if (italic) return <em key={i}>{italic[1]}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="chat-code">
      <div className="chat-code-bar">
        <span>{lang || "code"}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ChatText({ text }: { text: string }) {
  const chunks = text.replace(/\r\n/g, "\n").split(/```([\w-]*)\n?([\s\S]*?)```/g);
  const nodes = [];
  for (let i = 0; i < chunks.length; i += 3) {
    const prose = chunks[i] ?? "";
    if (prose.trim()) {
      const blocks = prose.trim().split(/\n{2,}/);
      nodes.push(
        <div key={`p-${i}`} className="chat-md">
          {blocks.map((block, bi) => {
            const lines = block.split("\n").filter((line) => line.trim());
            if (!lines.length) return null;
            if (/^#{1,3}\s/.test(lines[0]) && lines.length === 1) {
              const level = (lines[0].match(/^#+/)?.[0].length ?? 2) as 1 | 2 | 3;
              const Tag = (`h${Math.min(3, level)}` as "h1" | "h2" | "h3");
              return <Tag key={bi}>{inlineBits(lines[0].replace(/^#{1,3}\s+/, ""))}</Tag>;
            }
            if (lines.every((line) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line))) {
              return (
                <ul key={bi}>
                  {lines.map((line, j) => (
                    <li key={j}>{inlineBits(line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ""))}</li>
                  ))}
                </ul>
              );
            }
            if (lines[0].includes("|") && lines.length > 1) {
              const rows = lines.filter((line) => !/^\s*\|?\s*-{2,}/.test(line)).map((line) =>
                line.split("|").map((cell) => cell.trim()).filter(Boolean)
              );
              if (rows[0]?.length > 1) {
                return (
                  <div key={bi} className="chat-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {rows[0].map((cell, j) => (
                            <th key={j}>{inlineBits(cell)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(1).map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, j) => (
                              <td key={j}>{inlineBits(cell)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
            }
            if (lines.every((line) => /^>\s?/.test(line))) {
              return (
                <blockquote key={bi}>
                  {lines.map((line, j) => (
                    <p key={j}>{inlineBits(line.replace(/^>\s?/, ""))}</p>
                  ))}
                </blockquote>
              );
            }
            return (
              <p key={bi}>
                {lines.map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {inlineBits(line)}
                  </Fragment>
                ))}
              </p>
            );
          })}
        </div>
      );
    }
    const lang = chunks[i + 1];
    const code = chunks[i + 2];
    if (code !== undefined) {
      nodes.push(<CodeBlock key={`c-${i}`} lang={lang || "code"} code={code.replace(/\n$/, "")} />);
    }
  }
  return <>{nodes}</>;
}
