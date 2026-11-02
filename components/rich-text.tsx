import { Fragment } from "react";

type Token = { word: string; italic: boolean };

// Títulos editáveis no admin: cada linha do campo vira uma linha do título e *trechos entre asteriscos* ficam em itálico.
function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  line.split(/(\*[^*]+\*)/).forEach(part => {
    if (!part) return;
    const italic = part.startsWith("*") && part.endsWith("*") && part.length > 2;
    for (const word of (italic ? part.slice(1, -1) : part).split(/\s+/)) if (word) tokens.push({ word, italic });
  });
  return tokens;
}

export function RichTitle({ text, split = false }: { text: string; split?: boolean }) {
  let offset = 0;
  return <>{text.split("\n").map((line, lineIndex) => {
    const tokens = tokenize(line);
    // Palavras em itálico consecutivas ficam no mesmo <em>, como no título original.
    const groups: Token[][] = [];
    for (const token of tokens) {
      const last = groups.at(-1);
      if (last && last[0].italic === token.italic) last.push(token); else groups.push([token]);
    }
    const rendered = groups.map((group, groupIndex) => {
      const words = group.map((token, index) => {
        const content = split ? <span className="word"><span style={{ "--w": offset++ } as React.CSSProperties}>{token.word}</span></span> : token.word;
        return <Fragment key={index}>{index > 0 && " "}{content}</Fragment>;
      });
      return <Fragment key={groupIndex}>{groupIndex > 0 && " "}{group[0].italic ? <em>{words}</em> : words}</Fragment>;
    });
    return <Fragment key={lineIndex}>{lineIndex > 0 && <br />}{rendered}</Fragment>;
  })}</>;
}

// Texto corrido: linhas em branco separam parágrafos.
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return <>{text.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean).map((paragraph, index) => <p className={className} key={index}>{paragraph}</p>)}</>;
}
