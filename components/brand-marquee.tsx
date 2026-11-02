import { Fragment } from "react";
import type { Section } from "@/lib/types";
import { LogoSymbol } from "./logo";
import { RichTitle } from "./rich-text";

// Faixa tipográfica das peças do rebranding; o deslocamento acompanha o scroll (ScrollEffects).
// A primeira linha vem do título da seção e a segunda (contornada) do texto.
export function BrandMarquee({ section }: { section: Section }) {
  const rows = [{ direction: 1, phrase: section.title }, { direction: -1, phrase: section.text }].filter(row => row.phrase.trim());
  const label = rows.map(row => row.phrase.replace(/\*/g, "")).join(". ");
  return <section className="brand-marquee" id={section.id} aria-label={label}>
    {rows.map(row => <div className={`marquee-row ${row.direction < 0 ? "marquee-row-outline" : ""}`} data-marquee={row.direction} aria-hidden="true" key={row.direction}>
      {Array.from({ length: 4 }, (_, index) => <Fragment key={index}><span><RichTitle text={row.phrase.replace(/\n/g, " ")} /></span><LogoSymbol className="marquee-symbol" /></Fragment>)}
    </div>)}
  </section>;
}
