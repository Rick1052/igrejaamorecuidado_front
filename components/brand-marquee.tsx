import { Fragment } from "react";
import { LogoSymbol } from "./logo";

const ROWS = [
  { direction: 1, phrase: <>Lugar de <em>céus</em> abertos</> },
  { direction: -1, phrase: <>uma <em>família</em> para pertencer</> }
];

// Faixa tipográfica das peças do rebranding; o deslocamento acompanha o scroll (ScrollEffects).
export function BrandMarquee() {
  return <section className="brand-marquee" aria-label="Lugar de céus abertos. Uma família para pertencer.">
    {ROWS.map(row => <div className={`marquee-row ${row.direction < 0 ? "marquee-row-outline" : ""}`} data-marquee={row.direction} aria-hidden="true" key={row.direction}>
      {Array.from({ length: 4 }, (_, index) => <Fragment key={index}><span>{row.phrase}</span><LogoSymbol className="marquee-symbol" /></Fragment>)}
    </div>)}
  </section>;
}
