import { Fragment } from "react";

// Quebra o texto em palavras mascaradas para a entrada palavra por palavra (.split-title em globals.css).
export function SplitWords({ text, offset = 0 }: { text: string; offset?: number }) {
  return <>{text.split(" ").map((word, index) => <Fragment key={`${word}-${index}`}>{index > 0 && " "}<span className="word"><span style={{ "--w": offset + index } as React.CSSProperties}>{word}</span></span></Fragment>)}</>;
}
