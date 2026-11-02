import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Section, SiteData } from "@/lib/types";
import { Paragraphs, RichTitle } from "./rich-text";

export function FaceToFaceSection({ section, events }: { section: Section; events: SiteData["faceToFace"] }) {
  return <section className="face-section section" id={section.id}>
    <div className="wrap face-section-grid">
      <div className="face-section-copy">
        {section.eyebrow && <p className="eyebrow dark">{section.eyebrow}</p>}
        <h2><RichTitle text={section.title} /></h2>
        <Paragraphs text={section.text} />
      </div>
      <div className="face-event-grid">
        {([events.men, events.women] as const).map(event => <article className="face-event-card" key={event.title}>
          {event.cardImage && <div className="face-event-image"><Image src={event.cardImage} alt={`Arte do ${event.title}`} fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 360px" /></div>}
          <div className="face-event-content"><p>{event.date}</p><h3>{event.title}</h3><a className="button button-dark" href={event.url} target="_blank" rel="noreferrer">Fazer inscrição <ArrowRight /></a></div>
        </article>)}
      </div>
    </div>
  </section>;
}
